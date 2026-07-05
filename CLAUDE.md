# CLAUDE.md

This is Arnav Rastogi's personal academic website, deployed at **arnav.rastogi.net.in** via GitHub Pages.

## Tech Stack

- **Jekyll** with the **al-folio** academic theme
- **Pixi** for environment management (Python 3.14, Ruby 3.4, Node.js 25.2)
- **SCSS/SASS** for styling, Bootstrap 4 for layout
- **Chart.js, Plotly, ECharts, Vega-Lite** for visualizations
- **MathJax** for LaTeX math rendering
- **jekyll-scholar** for bibliography/citations
- **Giscus** (GitHub Discussions) for blog comments

## Development Commands

```bash
pixi run install   # Install all dependencies (Ruby gems + npm packages)
pixi run dev       # Start dev server at localhost:4000
pixi run build     # Production build
pixi run clean     # Clean build artifacts
pixi run purgecss  # Remove unused CSS (run after build)
```

Direct equivalents if pixi is unavailable:
```bash
bundle install && npm install
bundle exec jekyll serve --livereload
JEKYLL_ENV=production bundle exec jekyll build
```

## Content Structure

| Directory | Purpose |
|-----------|---------|
| `_posts/` | Blog posts (YYYY-MM-DD-slug.md) |
| `_pages/` | Static pages (about, cv, projects, publications, etc.) |
| `_projects/` | Portfolio project cards |
| `_books/` | Book reviews |
| `_news/` | Announcements |
| `_bibliography/` | BibTeX citation data (papers.bib) |
| `_data/` | YAML data files (socials, coauthors, venues, travel, repositories) |
| `_includes/` | Liquid template partials |
| `_layouts/` | Liquid layout templates |
| `_sass/` | SCSS stylesheets |
| `_plugins/` | Custom Ruby plugins |
| `assets/` | Static assets (js, css, img, pdf, fonts) |

## Key Configuration

- **`_config.yml`** — Main Jekyll config: site metadata, analytics (GA4: G-E2WKVSE8KT), plugin settings, CDN library references
- **`pixi.toml`** — Build tasks and environment spec
- **`purgecss.config.js`** — CSS purging (run after production build)
- **`CNAME`** — Custom domain

## Writing Blog Posts

Posts go in `_posts/` with filename format `YYYY-MM-DD-slug.md`. Standard front matter:

```yaml
---
layout: post
title: "Post Title"
date: YYYY-MM-DD HH:MM:SS +0530
description: Short description
tags: [tag1, tag2]
categories: category
---
```

**Interactive charts:** Use fenced code blocks with language `chartjs` — `chartjs-setup.js` auto-converts them to Chart.js canvases. Radar charts with the same title are grouped side-by-side.

**Math:** Wrap LaTeX in `$$...$$` (display) or `$...$` (inline). MathJax handles rendering.

## Deployment

Pushes to `main` trigger the GitHub Actions workflow (`.github/workflows/deploy.yml`) which:
1. Installs deps via pixi
2. Builds with `JEKYLL_ENV=production`
3. Runs PurgeCSS
4. Deploys to GitHub Pages

The workflow only runs when relevant files change (markdown, YAML, JS, CSS, Ruby).

## Resume Sync

The CV PDF is auto-fetched from the latest release of the [ARC345/resume](https://github.com/ARC345/resume) repository. The `fetch-resume` task:
- Fetches the latest `Arnav_Rastogi_research.pdf` from GitHub releases
- Runs automatically as part of `pixi run dev` and `pixi run build`
- Ensures the website always has the latest resume on deployment

To manually sync: `pixi run fetch-resume`

## Automated Workflows

- **Weekly:** GitHub repo sync, broken link checks, accessibility (axe) tests
- **On PR:** Prettier formatting check, CodeQL security scan
- **On push to main:** Full deploy pipeline + Lighthouse performance badge

## Pre-commit Hooks

Configured in `.pre-commit-config.yaml`: trailing whitespace, EOF newlines, YAML validation, large file detection. Install with `pre-commit install`.
