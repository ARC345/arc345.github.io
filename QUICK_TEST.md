# Quick Testing Guide

## 🚀 Fastest Way to Test

Run the automated test script:

```bash
./test-setup.sh
```

This will test:
- ✅ pixi installation
- ✅ Dependency installation
- ✅ requirements.txt generation
- ✅ Jekyll build
- ✅ CSS purging

## 📋 Manual Testing Steps

### 1. Install Dependencies
```bash
pixi install
```

### 2. Generate requirements.txt
```bash
pixi run export-requirements
```

### 3. Build the Site
```bash
pixi run build
```

### 4. Test Development Server (optional)
```bash
pixi run dev
# Visit http://localhost:4000
```

## 🔍 Verify Everything Works

### Check Dependencies
```bash
pixi list
```

Should show: ruby, nodejs, python, imagemagick, nbconvert, etc.

### Check Generated Files
```bash
ls -la requirements.txt  # Should exist
ls -la _site/            # Should exist after build
```

### Check Tasks
```bash
pixi task list
```

Should show: install, dev, build, clean, export-requirements, purgecss

## 🧪 Test GitHub Actions

### Option 1: Manual Trigger
1. Go to GitHub → Actions
2. Select "Update requirements.txt"
3. Click "Run workflow" → "Run workflow"

### Option 2: Trigger by Changing pixi.toml
1. Edit `pixi.toml` (change a version or add a comment)
2. Commit and push
3. Watch the workflow run automatically

### Option 3: Test Deploy Workflow
1. Make a small change to any markdown file
2. Commit and push
3. Check Actions tab for "Deploy site" workflow

## ⚠️ Common Issues

**"pixi: command not found"**
→ Install pixi: https://pixi.sh/install/

**"bundle: command not found"**
→ Run `pixi install` first (it installs bundler)

**Build fails**
→ Check that all dependencies are installed: `pixi list`

**Workflow fails in GitHub Actions**
→ Check workflow logs in Actions tab for specific errors

## ✅ Success Checklist

- [ ] `pixi install` works
- [ ] `pixi run export-requirements` creates requirements.txt
- [ ] `pixi run build` creates _site directory
- [ ] `pixi run dev` starts server (optional)
- [ ] GitHub Actions workflows run successfully
- [ ] requirements.txt auto-updates when pixi.toml changes
