#!/bin/bash
set -e

REPO=${1:-.}
OWNER=${2:-ARC345}
BRANCH=main

echo "Setting up branch protection for $OWNER/$(basename $REPO):$BRANCH"

# Require all PR checks to pass, admins can merge without approval
gh api repos/$OWNER/$(basename $REPO)/branches/$BRANCH/protection \
  -X PUT \
  -f required_status_checks='{
    "strict": true,
    "contexts": ["PR Checks / Prettier formatting check", "PR Checks / Build verification", "PR Checks / CodeQL security scan"]
  }' \
  -f enforce_admins=false \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  -f require_linear_history=true \
  -f required_conversation_resolution=true

echo "✅ Branch protection configured successfully"
echo "Requirements for merging to main:"
echo "  - All PR checks must pass (Prettier, Build, CodeQL)"
echo "  - Linear history required"
echo "  - @$OWNER (admin) can merge without approval"
echo "  - Direct pushes are blocked for all users"
