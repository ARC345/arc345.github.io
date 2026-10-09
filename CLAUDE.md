# CLAUDE.md

This is Arnav Rastogi's personal academic website, deployed at **arnav.rastogi.net.in** via GitHub Pages.

## Tech Stack

- **Jekyll** with the **al-folio v1** starter: layouts, includes, Sass and feature JS come from versioned `al_*` gems (pinned in `Gemfile`, activated in `_config.yml` `plugins:`)
- **Pixi** for environment management (Python 3.14, Ruby 3.4, Node.js 25.2)
- **SCSS/SASS** (`@use` modules) on top of al-folio's prebuilt Tailwind CSS; no Bootstrap or jQuery at runtime
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

## Theme Overrides (al-folio v1)

The theme lives in gems, so a local file at the same path overrides the gem's copy. The site's intentional overrides:

- `_layouts/about.liquid` (two-column about page), `_layouts/default.liquid` (no footer), `_layouts/cv.liquid` + `_includes/cv/render.liquid` (RenderCV page)
- `_sass/_variables.scss`, `_sass/_themes.scss`, `_sass/_layout.scss`, `assets/css/main.scss`: copies of `al_folio_core`'s files with the site palette and layout added
- `_sass/_identity.scss` (typography, focus, motion) and `_sass/_compat.scss` (Bootstrap rules the markup still needs)
- `assets/al_charts/js/chartjs-setup.js` (radar grouping); `_plugins/al_charts_overrides.rb` stops the gem's copy overwriting it

They are recorded in `.al-folio-overrides.yml`. After bumping an `al_*` gem, run `bundle exec al-folio upgrade audit`. It flags overrides whose gem originals changed; review them with `bundle exec al-folio upgrade overrides diff PATH`, then `... overrides accept PATH`.

To pull a newer al-folio starter: `git fetch https://github.com/alshedivat/al-folio.git main` and merge it. The history is connected, so only real conflicts show up.

## Content Structure

| Directory        | Purpose                                                            |
| ---------------- | ------------------------------------------------------------------ |
| `_posts/`        | Blog posts (YYYY-MM-DD-slug.md)                                    |
| `_pages/`        | Static pages (about, cv, projects, publications, etc.)             |
| `_projects/`     | Portfolio project cards                                            |
| `_books/`        | Book reviews                                                       |
| `_news/`         | Announcements                                                      |
| `_bibliography/` | BibTeX citation data (papers.bib)                                  |
| `_data/`         | YAML data files (socials, coauthors, venues, travel, repositories) |
| `_includes/`     | Liquid template partials                                           |
| `_layouts/`      | Liquid layout templates                                            |
| `_sass/`         | SCSS stylesheets                                                   |
| `_plugins/`      | Custom Ruby plugins                                                |
| `assets/`        | Static assets (js, css, img, pdf, fonts)                           |

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
