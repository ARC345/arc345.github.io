# Website Improvements & Features to Explore

This document outlines things you can do to improve your al-folio website, features you can utilize, and steps towards a more data-driven architecture.

## 1. Housekeeping (Global & Content)
These are immediate actions to clean up placeholder data and configure the site properly.

- [ ] **Bibliography**: Replace "Albert Einstein" entries in `_bibliography/papers.bib` with your own BibTeX.
- [ ] **CV Configuration**:
    - Currently, `_config.yml` pulls data from a Gist.
    - **Action**: Decide if you want to keep the Gist or move to local `_data/cv.yml`.
    - **Cleanup**: Remove Einstein's timeline from `_data/cv.yml` so it doesn't accidentally show up as a fallback.
- [ ] **Enable Analytics**:
    - `_config.yml`: Set `enable_google_analytics: true` and add your ID.
- [ ] **Social Metadata**:
    - `_config.yml`: Set `serve_og_meta: true`. This ensures your links look good (with images/summaries) when shared on Twitter/LinkedIn.

## 2. Advanced Features (built-in to al-folio)
You have several powerful libraries installed but not yet fully utilized.

### Interactive Components
- **Charts**: Use `chartjs`, `echarts`, or `plotly` tags directly in your Markdown to render interactive graphs instead of static images.
- **Maps (Leaflet)**: Create interactive maps (e.g., for a "Travel" or "Conferences" page) using the `leaflet` inclusion.
- **Code Diffs**: Use `diff2html` to show pretty Git-style diffs in your technical posts.

### Content types
- **Jupyter Notebooks**: Drop `.ipynb` files directly into `_posts` or `_projects`. The `jekyll-jupyter-notebook` plugin will render them as blog posts.
- **Mermaid Diagrams**: Use `mermaid` code blocks to define flowcharts and diagrams as text.

## 3. Moving to a Data-Based Approach
To make the site easier to maintain and update, separate **content** (HTML/Markdown) from **data** (YAML/JSON).

- **Localize Resume**:
    - **Current**: `jekyll_get_json` fetches `resume.json` from a remote Gist.
    - **Proposed**: Download that JSON to `_data/resume.json`.
    - **Benefit**: Your resume becomes part of your Git history/PRs. You can edit it locally and see updates immediately.
- **Structured "People" Data**:
    - Instead of hardcoding collaborators in `about.md` or `projects.md`, create `_data/people.yml`.
    - Use Liquid loops (`{% for person in site.data.people %}`) to render grids of avatars/names.
- **Publication Stats**:
    - Populate `_data/venues.yml` (currently empty).
    - You can then generate charts (using the Chart.js feature above) to show your publication count by venue/year automatically.
