# Testing Guide

This guide helps you verify that the pixi-based setup is working correctly.

## Prerequisites

1. Install pixi: https://pixi.sh/install/
   ```bash
   curl -fsSL https://pixi.sh/install.sh | bash
   ```

## Local Testing

### 1. Test Environment Setup

```bash
# Install all dependencies
pixi install

# Verify dependencies are installed
pixi list
```

You should see:
- ruby (>=3.4.8)
- nodejs (>=25.2.1)
- python (>=3.14.2)
- imagemagick (>=7.1.2_12)
- nbconvert (>=7.16.6)
- And other build tools

### 2. Test Requirements.txt Generation

```bash
# Generate requirements.txt from pixi.toml
pixi run export-requirements

# Verify the file was created/updated
cat requirements.txt
```

The file should contain Python dependencies (like `nbconvert`) and have a header comment explaining it's auto-generated.

### 3. Test Jekyll Build

```bash
# Build the site
pixi run build

# Check if _site directory was created
ls -la _site
```

The build should complete without errors and create the `_site` directory.

### 4. Test Development Server

```bash
# Start the development server
pixi run dev
```

The server should start on `http://localhost:4000` (or similar). Press `Ctrl+C` to stop.

### 5. Test CSS Purge

```bash
# Run purgecss
pixi run purgecss
```

This should process CSS files without errors.

## GitHub Actions Testing

### 1. Test Workflow Syntax

You can validate workflow files locally using `act` (optional):

```bash
# Install act (optional, for local workflow testing)
# https://github.com/nektos/act

# Test deploy workflow (dry run)
act -l
```

### 2. Manual Workflow Trigger

1. Go to your GitHub repository
2. Navigate to **Actions** tab
3. Select **Update requirements.txt** workflow
4. Click **Run workflow** → **Run workflow**
5. Check if it successfully generates and commits `requirements.txt`

### 3. Test Deploy Workflow

1. Make a small change to trigger the deploy workflow (e.g., edit a markdown file)
2. Push to `main` or `master` branch
3. Go to **Actions** tab
4. Watch the **Deploy site** workflow run
5. Verify it completes successfully

### 4. Test Requirements Auto-Update

1. Edit `pixi.toml` (e.g., change a version number)
2. Commit and push
3. The **Update requirements.txt** workflow should automatically run
4. Check if it commits an updated `requirements.txt`

## Verification Checklist

- [ ] `pixi install` completes without errors
- [ ] `pixi run export-requirements` generates `requirements.txt`
- [ ] `pixi run build` creates `_site` directory
- [ ] `pixi run dev` starts the development server
- [ ] `pixi run purgecss` runs without errors
- [ ] GitHub Actions workflows run successfully
- [ ] `requirements.txt` is auto-updated when `pixi.toml` changes

## Troubleshooting

### Issue: `pixi: command not found`

**Solution**: Install pixi from https://pixi.sh/install/

### Issue: Build fails with "bundle: command not found"

**Solution**: Make sure you run `pixi install` first, which installs bundler via the `install` task.

### Issue: ImageMagick errors

**Solution**: ImageMagick should be installed via pixi. Verify with `pixi list | grep imagemagick`

### Issue: Requirements.txt not updating in GitHub Actions

**Solution**: 
- Check workflow permissions (should have `contents: write`)
- Verify the workflow runs on `pixi.toml` changes
- Check workflow logs for errors

### Issue: Workflow fails with "pixi: command not found"

**Solution**: The workflow uses `prefix-dev/setup-pixi@v0.10.0` action. If it fails, check:
- The action version is correct
- GitHub Actions has network access
- The workflow file syntax is correct

## Quick Test Script

Run this to test everything at once:

```bash
#!/bin/bash
set -e

echo "🧪 Testing pixi setup..."

echo "1. Installing dependencies..."
pixi install

echo "2. Exporting requirements.txt..."
pixi run export-requirements

echo "3. Building site..."
pixi run build

echo "4. Testing purgecss..."
pixi run purgecss

echo "✅ All tests passed!"
```

Save as `test.sh`, make it executable (`chmod +x test.sh`), and run it.
