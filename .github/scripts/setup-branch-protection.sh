#!/bin/bash
set -e

REPO=${1:-.}
OWNER=${2:-ARC345}
BRANCH=main

echo "Setting up branch protection for $OWNER/$(basename $REPO):$BRANCH"

# Require PR reviews from ARC345 only
gh api repos/$OWNER/$(basename $REPO)/branches/$BRANCH/protection \
  -X PUT \
  -f required_status_checks='{
    "strict": true,
    "contexts": ["PR Checks / Prettier formatting check", "PR Checks / Build verification", "PR Checks / CodeQL security scan"]
  }' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "restrict_dismissals": true,
    "dismissal_restrictions": {
      "users": ["'$OWNER'"],
      "teams": []
    }
  }' \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  -f require_linear_history=true \
  -f required_conversation_resolution=true

echo "✅ Branch protection configured successfully"
echo "Requirements for merging to main:"
echo "  - All PR checks must pass"
echo "  - 1 approval from @$OWNER required"
echo "  - Linear history required"
echo "  - Direct pushes are blocked"
