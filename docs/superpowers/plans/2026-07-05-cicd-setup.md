# CI/CD Setup with PR-Gated Main Branch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a PR-gated deployment workflow where main branch requires PR review from ARC345, prevents direct pushes, and auto-deploys on successful merge.

**Architecture:** Use GitHub branch protection rules to enforce PR reviews and block direct pushes to main. Consolidate and enhance existing workflows (deploy, prettier, tests) into a cohesive CI/CD pipeline. Deploy only runs on successful PRs merged to main. All validation runs on PRs first.

**Tech Stack:** GitHub Actions, GitHub branch protection rules, Jekyll, Pixi, Prettier

## Global Constraints

- All deployments must originate from merges to `main`, never from direct pushes
- Only user `ARC345` can approve and merge PRs to `main`
- Direct pushes to `main` must be rejected by GitHub
- All PRs must pass formatting, build, and security checks before merge is allowed

---

## File Structure

**To be created/modified:**
- `.github/workflows/deploy.yml` — Main deployment workflow (already exists, needs cleanup)
- `.github/workflows/pr-checks.yml` — Consolidated PR validation (new)
- `.github/scripts/setup-branch-protection.sh` — GitHub CLI script to enforce branch rules (new, optional)
- `CONTRIBUTING.md` — Document workflow and contribution process (new/update)

---

## Task 1: Clean up and refine the deploy workflow

**Files:**
- Modify: `.github/workflows/deploy.yml:1-105`

**Interfaces:**
- Consumes: Nothing
- Produces: Clean deploy workflow that only runs on pushes to main (no master), with proper safeguards

**Steps:**

- [ ] **Step 1: Review current deploy.yml and identify changes**

Current issues:
- Supports both `master` and `main` branches (should be main only)
- Path filters are verbose and exclude many workflow files
- No explicit environment protection for production deployment

- [ ] **Step 2: Update branch triggers to main only**

Open `.github/workflows/deploy.yml` and replace the `on.push.branches` section:

```yaml
on:
  push:
    branches:
      - main
    paths:
      - "assets/**"
      - "_sass/**"
      - "_scripts/**"
      - "**.bib"
      - "**.html"
      - "**.js"
      - "**.liquid"
      - "**/*.md"
      - "**.yml"
      - "Gemfile"
      - "Gemfile.lock"
      - "pixi.toml"
      - "pixi.lock"
      - "requirements.txt"
      - "!.github/workflows/axe.yml"
      - "!.github/workflows/broken-links.yml"
      - "!.github/workflows/prettier.yml"
      - "!lighthouse_results/**"
```

Also remove the entire `pull_request` section (lines 36-67) since PR checks belong in a separate workflow.

- [ ] **Step 3: Run the workflow to verify it loads correctly**

```bash
gh workflow list
```

Expected output should show `deploy.yml` with no errors.

- [ ] **Step 4: Commit the changes**

```bash
git add .github/workflows/deploy.yml
git commit -m "chore: simplify deploy workflow to main branch only"
```

---

## Task 2: Create comprehensive PR validation workflow

**Files:**
- Create: `.github/workflows/pr-checks.yml`

**Interfaces:**
- Consumes: Source code in PR
- Produces: Success/failure status on PR (required for branch protection rule)

**Steps:**

- [ ] **Step 1: Create the pr-checks.yml file**

```bash
cat > .github/workflows/pr-checks.yml << 'EOF'
name: PR Checks

on:
  pull_request:
    branches:
      - main
      - dev
    paths:
      - "assets/**"
      - "_sass/**"
      - "_scripts/**"
      - "**.bib"
      - "**.html"
      - "**.js"
      - "**.liquid"
      - "**/*.md"
      - "**.yml"
      - "Gemfile"
      - "Gemfile.lock"
      - "pixi.toml"
      - "pixi.lock"
      - "requirements.txt"
      - ".github/workflows/pr-checks.yml"

permissions:
  contents: read
  pull-requests: write

jobs:
  format-check:
    name: Prettier formatting check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v4
      - name: Setup Node.js ⚙️
        uses: actions/setup-node@v4
      - name: Install Prettier 💾
        run: npm install --save-dev --save-exact prettier @shopify/prettier-plugin-liquid
      - name: Prettier Check 🔎
        run: npx prettier . --check

  build-check:
    name: Build verification
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v4
      - name: Install pixi 🦊
        uses: prefix-dev/setup-pixi@v0.9.3
        with:
          pixi-version: latest
          cache: true
      - name: Install dependencies 📦
        run: pixi run install
      - name: Build site 🔧
        run: |
          export JEKYLL_ENV=production
          pixi run build
      - name: Verify site output 📦
        run: |
          if [ ! -d "_site" ]; then
            echo "Build failed: _site directory not created"
            exit 1
          fi
          if [ ! -f "_site/index.html" ]; then
            echo "Build failed: index.html not found in _site"
            exit 1
          fi

  security-scan:
    name: CodeQL security scan
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v4
      - name: Initialize CodeQL 🔐
        uses: github/codeql-action/init@v3
        with:
          languages: javascript,python
      - name: Autobuild 🔨
        uses: github/codeql-action/autobuild@v3
      - name: Perform CodeQL Analysis 📊
        uses: github/codeql-action/analyze@v3

EOF
```

- [ ] **Step 2: Verify the file was created**

```bash
wc -l .github/workflows/pr-checks.yml
```

Expected: ~70+ lines

- [ ] **Step 3: Validate YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/pr-checks.yml'))" && echo "YAML valid"
```

Expected output: `YAML valid`

- [ ] **Step 4: Commit the new workflow**

```bash
git add .github/workflows/pr-checks.yml
git commit -m "feat: add comprehensive PR validation workflow (format, build, security)"
```

---

## Task 3: Update existing workflows to reference main only

**Files:**
- Modify: `.github/workflows/prettier.yml:1-49`
- Modify: `.github/workflows/codeql.yml` (if exists)
- Modify: other workflows that reference master

**Interfaces:**
- Consumes: Updated configuration
- Produces: Workflows that only target main branch

**Steps:**

- [ ] **Step 1: Update prettier.yml to remove push trigger (it's now in pr-checks.yml)**

Replace the entire `on` section in `.github/workflows/prettier.yml` (lines 3-11):

```yaml
on:
  pull_request:
    branches:
      - main
```

This removes the `push` trigger since prettier validation is now part of pr-checks.

- [ ] **Step 2: Find and update any other workflows referencing master**

```bash
grep -r "master" .github/workflows/*.yml
```

For each file that references `master`, replace with `main` only. Example:

```bash
sed -i 's/- master/-/g' .github/workflows/codeql.yml
sed -i 's/- master//g' .github/workflows/lighthouse-badger.yml
```

- [ ] **Step 3: Run a quick validation**

```bash
gh workflow list
```

Verify all workflows show valid status.

- [ ] **Step 4: Commit the changes**

```bash
git add .github/workflows/
git commit -m "chore: update all workflows to main branch only"
```

---

## Task 4: Set up branch protection rules via GitHub CLI

**Files:**
- Create: `.github/scripts/setup-branch-protection.sh`

**Interfaces:**
- Consumes: GitHub CLI (`gh`) with authenticated session
- Produces: Enforced branch protection on main

**Steps:**

- [ ] **Step 1: Create the branch protection setup script**

```bash
mkdir -p .github/scripts
cat > .github/scripts/setup-branch-protection.sh << 'EOF'
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

EOF
chmod +x .github/scripts/setup-branch-protection.sh
```

- [ ] **Step 2: Verify script syntax**

```bash
bash -n .github/scripts/setup-branch-protection.sh
```

Expected: No output (syntax valid)

- [ ] **Step 3: Create documentation for setup**

```bash
cat > CONTRIBUTING.md << 'EOF'
# Contributing to arnav.rastogi.net.in

## Workflow

This repository uses a protected main branch with the following rules:

1. **Development on `dev` branch**: All feature work happens on branches created from `dev`
2. **Pull Request Required**: Changes to `main` only via PR
3. **Approval Required**: PRs to `main` require 1 approval from `@ARC345`
4. **Automated Checks**: All PRs must pass:
   - Prettier formatting check
   - Jekyll build verification
   - CodeQL security scan
5. **No Direct Pushes**: Direct pushes to `main` are blocked by GitHub

## Getting Started

```bash
# Clone the repository
git clone https://github.com/ARC345/arc345.github.io.git
cd arc345.github.io

# Switch to dev branch
git switch dev

# Create a feature branch
git switch -c feature/your-feature

# Install dependencies
pixi run install

# Start development server
pixi run dev
```

## Making Changes

1. Create a feature branch from `dev`
2. Make your changes
3. Test locally: `pixi run dev`
4. Commit with clear messages
5. Push to origin
6. Open a PR against `dev` (or `main` if approved by ARC345)
7. Address any feedback from automated checks or reviewers

## Setting Up Branch Protection (Admin Only)

If you're setting up a fresh fork or new repository, run:

```bash
gh auth login
.github/scripts/setup-branch-protection.sh $(pwd) ARC345
```

This configures:
- Require all PR checks to pass
- Require 1 approval from `@ARC345`
- Block direct pushes
- Require linear history

## Questions?

See [CLAUDE.md](./CLAUDE.md) for technical documentation about the project.

EOF
```

- [ ] **Step 4: Commit everything**

```bash
git add .github/scripts/setup-branch-protection.sh CONTRIBUTING.md
git commit -m "docs: add branch protection setup script and contribution guidelines"
```

---

## Task 5: Push to remote and verify workflows

**Files:**
- No files created/modified (push existing changes)

**Interfaces:**
- Consumes: Committed changes
- Produces: Remote branch with workflows enabled

**Steps:**

- [ ] **Step 1: Push dev branch to remote**

```bash
git push -u origin dev
```

Expected: Branch tracking established.

- [ ] **Step 2: Verify workflows load on GitHub**

Open https://github.com/ARC345/arc345.github.io/actions and verify:
- `Deploy site` workflow exists
- `PR Checks` workflow exists
- All workflows show as "enabled"

- [ ] **Step 3: Create a test PR to dev branch to verify PR checks run**

```bash
git switch -c test/workflow-validation
echo "# Test PR" >> README.md
git add README.md
git commit -m "test: verify PR checks workflow"
git push -u origin test/workflow-validation
```

Then open a PR on GitHub and wait for checks to run.

- [ ] **Step 4: Verify all PR checks pass**

In the GitHub PR, confirm:
- ✅ Prettier formatting check passes
- ✅ Build verification passes
- ✅ CodeQL security scan passes

- [ ] **Step 5: Close the test PR (don't merge)**

On GitHub, close the PR without merging.

- [ ] **Step 6: Manually set branch protection on main (if not using the script)**

Navigate to: **Settings → Branches → Branch protection rules**

Configure for `main`:
- ✓ Require a pull request before merging
- ✓ Require approvals (1 required)
- ✓ Require approval from CODEOWNERS (if available, otherwise just manual approval from ARC345)
- ✓ Dismiss stale pull request approvals when new commits are pushed
- ✓ Require status checks to pass before merging
  - ✓ Require branches to be up to date before merging
  - Select: "Prettier formatting check", "Build verification", "CodeQL security scan"
- ✓ Require linear history
- ✓ Include administrators
- ✓ Restrict who can push to matching branches (ARC345 only)
- ✓ Require conversation resolution before merging

- [ ] **Step 7: Verify the dev branch is protected too (optional, less strict)**

Navigate to: **Settings → Branches**

Create a branch protection rule for `dev`:
- ✓ Require status checks to pass before merging (optional)
- ✓ Require approvals (optional, 0 required)
- ✗ Include administrators

---

## Summary of Changes

**Workflows:**
- ✅ `deploy.yml` - Cleaned up, main branch only, no PR triggers
- ✅ `pr-checks.yml` - New, comprehensive PR validation (format, build, security)
- ✅ Other workflows - Updated to reference main only

**Documentation:**
- ✅ `CONTRIBUTING.md` - Guide for contributors, branch protection setup
- ✅ `.github/scripts/setup-branch-protection.sh` - Automated branch rule setup

**GitHub Settings:**
- ✅ Branch protection on `main` enforces PR requirement
- ✅ Only `@ARC345` can approve/merge PRs to `main`
- ✅ All PR checks must pass before merge
- ✅ Direct pushes to `main` are rejected
