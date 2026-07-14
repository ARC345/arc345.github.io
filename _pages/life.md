---
layout: page
title: life
permalink: /life/
description: "cellular automata, right here, right now"
nav: false
---

Conway's **Game of Life** — a zero-player cellular automaton where cells live, die, and evolve based on four simple rules. It's one of those ideas that looks like a toy but touches computation, emergence, and the edge of chaos. I've been fascinated by it for years. This one seeds itself from my site data — travel coordinates, blog posts, projects. Press **Start** and watch what grows.

<div id="gol-container">
  <div id="gol-controls">
    <button id="gol-toggle" class="btn btn-sm btn-outline-primary">▶ Start</button>
    <button id="gol-clear" class="btn btn-sm btn-outline-danger">✕ Clear</button>
    <button id="gol-random" class="btn btn-sm btn-outline-secondary">↺ Random</button>
    <label class="gol-speed-label">
      <span id="gol-speed-val">8</span> fps
      <input type="range" id="gol-speed" min="1" max="20" value="8" class="gol-slider">
    </label>
    <span id="gol-gen" class="gol-gen-counter">gen 0</span>
  </div>
  <canvas id="gol-canvas"></canvas>
</div>

<script>
window.__lifeSeed = {
  blogCount: {{ site.posts | size }},
  travelCount: {{ site.data.travel | size }},
  projectCount: {{ site.projects | size }},
  travelCoords: [
    {% for trip in site.data.travel %}
    { lat: {{ trip.latitude }}, lng: {{ trip.longitude }}, name: "{{ trip.location }}" }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ]
};
</script>
<script defer src="{{ '/assets/js/game-of-life.js' | relative_url | bust_file_cache }}"></script>

**controls:** <kbd>Space</kbd> toggle · <kbd>C</kbd> clear · <kbd>R</kbd> randomize · <kbd>click</kbd> toggle cell
