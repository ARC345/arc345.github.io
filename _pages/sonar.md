---
layout: page
title: site sonar
permalink: /sonar/
description: "submarine-style radar sweeping through site content"
nav: true
nav_order: 9
---

A retro radar screen that sweeps through everything on this site — posts, projects, and books appear as glowing blips. Newer content sits closer to the center. Hover to identify, click to navigate.

<div id="sonar-container">
  <canvas id="sonar-canvas"></canvas>
  <div id="sonar-tooltip"></div>
</div>

<div id="sonar-legend">
  <span><span class="sonar-dot" style="background:#00bcd4"></span> Posts</span>
  <span><span class="sonar-dot" style="background:#8bc34a"></span> Projects</span>
  <span><span class="sonar-dot" style="background:#ffd700"></span> Books</span>
</div>

<div id="sonar-instructions">click a blip to navigate · sweep reveals content as it passes</div>

<script>
window.__sonarData = {
  posts: [
    {% for p in site.posts %}
    { title: "{{ p.title | escape | replace: '"', '\\"' }}", date: "{{ p.date }}", url: "{{ p.url | relative_url }}" }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ],
  projects: [
    {% for p in site.projects %}
    { title: "{{ p.title | escape | replace: '"', '\\"' }}", date: "{{ p.date }}", url: "{{ p.url | relative_url }}", category: "{{ p.category | escape }}" }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ],
  books: [
    {% for b in site.books %}
    { title: "{{ b.title | escape | replace: '"', '\\"' }}", date: "{{ b.finished | default: b.started }}", url: "{{ b.url | relative_url }}", author: "{{ b.author | escape }}" }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ]
};
</script>
<script defer src="{{ '/assets/js/site-sonar.js' | relative_url | bust_file_cache }}"></script>

<style>
#sonar-container {
  position: relative;
  width: 100%;
  max-width: 520px;
  margin: 1.5rem auto;
  cursor: pointer;
  user-select: none;
}

#sonar-canvas {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 50%;
  box-shadow:
    0 0 30px rgba(0, 180, 200, 0.06),
    inset 0 0 20px rgba(0, 0, 0, 0.4);
}

#sonar-tooltip {
  display: none;
  position: absolute;
  pointer-events: none;
  background: rgba(8, 8, 18, 0.94);
  border: 1px solid rgba(0, 180, 200, 0.25);
  border-radius: 4px;
  padding: 5px 10px;
  font-family: 'Courier New', 'Courier', monospace;
  font-size: 0.75rem;
  color: #c8c8c8;
  white-space: nowrap;
  z-index: 100;
  line-height: 1.4;
}

.sonar-tt-type {
  text-transform: uppercase;
  font-size: 0.6rem;
  letter-spacing: 1px;
  margin-right: 5px;
  font-weight: bold;
}

#sonar-legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 0.75rem;
  font-family: 'Courier New', 'Courier', monospace;
  font-size: 0.75rem;
  color: var(--global-text-color);
}

.sonar-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
  vertical-align: middle;
}

#sonar-instructions {
  text-align: center;
  font-size: 0.75rem;
  color: var(--global-text-color-light);
  margin-top: 0.35rem;
  font-style: italic;
}

@media (max-width: 576px) {
  #sonar-container {
    max-width: 100%;
  }
  #sonar-legend {
    gap: 0.75rem;
    font-size: 0.65rem;
    flex-wrap: wrap;
  }
}
</style>
