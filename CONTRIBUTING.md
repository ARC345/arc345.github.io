# Contributing to arnav.rastogi.net.in

## Workflow

This repository uses a protected main branch with the following rules:

1. **Development on `dev` branch**: All feature work happens on branches created from `dev`
2. **Pull Request Required**: Changes to `main` only via PR
3. **Automated Checks**: All PRs must pass:
   - Prettier formatting check
   - Jekyll build verification
   - CodeQL security scan
4. **No Direct Pushes**: Direct pushes to `main` are blocked by GitHub
5. **Admin Bypass**: `@ARC345` (repo admin) can merge PRs directly without requiring approval

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
- Require all PR checks to pass (Prettier, Build, CodeQL)
- Block direct pushes to all users
- Require linear history
- Allow `@ARC345` (admin) to merge without approval

## Questions?

See [CLAUDE.md](./CLAUDE.md) for technical documentation about the project.
