---
layout: page
title: vital signs
permalink: /vitals/
description: "real-time site health monitoring"
nav: true
nav_order: 10
---

<div id="vitals-monitor">
  <div id="vitals-crt">
    <!-- Patient Info Bar -->
    <div id="vitals-patient-bar">
      <span id="vitals-patient-name">NAME: arnav.rastogi.net.in</span>
      <span id="vitals-patient-dob">DOB: --</span>
      <span id="vitals-patient-status">STATUS: MONITORING</span>
    </div>

    <!-- Main Content -->
    <div id="vitals-main">
      <!-- Left: Vitals Grid -->
      <div id="vitals-grid">
        <div class="vital-box" id="vital-hr">
          <div class="vital-label">HR</div>
          <div class="vital-value-box">
            <span class="vital-value" id="vital-hr-value">--</span>
            <span class="vital-unit">bpm</span>
          </div>
          <div class="vital-trend" id="vital-hr-trend">
            <span class="vital-pulse">&#10084;</span>
          </div>
        </div>
        <div class="vital-box" id="vital-resp">
          <div class="vital-label">RESP</div>
          <div class="vital-value-box">
            <span class="vital-value" id="vital-resp-value">--</span>
            <span class="vital-unit">/min</span>
          </div>
          <div class="vital-trend" id="vital-resp-trend">--</div>
        </div>
        <div class="vital-box" id="vital-temp">
          <div class="vital-label">TEMP</div>
          <div class="vital-value-box">
            <span class="vital-value" id="vital-temp-value">--</span>
            <span class="vital-unit">&deg;C</span>
          </div>
          <div class="vital-trend" id="vital-temp-trend">--</div>
        </div>
        <div class="vital-box" id="vital-bp">
          <div class="vital-label">BP</div>
          <div class="vital-value-box">
            <span class="vital-value" id="vital-bp-value">--</span>
            <span class="vital-unit">mmHg</span>
          </div>
          <div class="vital-trend" id="vital-bp-trend">--</div>
        </div>
        <div class="vital-box" id="vital-spo2">
          <div class="vital-label">SpO<sub>2</sub></div>
          <div class="vital-value-box">
            <span class="vital-value" id="vital-spo2-value">--</span>
            <span class="vital-unit">%</span>
          </div>
          <div class="vital-trend" id="vital-spo2-trend">--</div>
        </div>
        <div class="vital-box" id="vital-act">
          <div class="vital-label">ACT</div>
          <div class="vital-value-box">
            <span class="vital-value" id="vital-act-value">--</span>
            <span class="vital-unit">%</span>
          </div>
          <div class="vital-trend" id="vital-act-trend-bar">
            <div class="vital-progress-bar">
              <div class="vital-progress-fill" id="vital-act-fill"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: EKG Canvas -->
      <div id="vitals-ekg-container">
        <canvas id="vitals-ekg-canvas"></canvas>
      </div>
    </div>

    <!-- Bottom: Diagnosis Panel -->
    <div id="vitals-diagnosis">
      <div id="vitals-diagnosis-line">
        <span class="vitals-prompt">&gt;</span>
        <span id="vitals-diagnosis-text">Initializing system diagnostics...</span>
        <span class="vitals-cursor">&#9610;</span>
      </div>
      <div id="vitals-alerts">
        <span class="vitals-alert-label">ALERTS:</span>
        <span id="vitals-alert-text">Monitoring...</span>
      </div>
    </div>

    <!-- Scan Line Overlay -->
    <div id="vitals-scanline"></div>
  </div>
</div>

<script>
window.__vitals = {
  postCount: {{ site.posts | size }},
  projectCount: {{ site.projects | size }},
  travelCount: {{ site.data.travel | size }},
  pageCount: {{ site.pages | size }},
  bookCount: {{ site.books | size }},
  newsCount: {{ site.news | size }},
  lastPostDate: "{{ site.posts.first.date }}",
  firstPostDate: "{{ site.posts.last.date }}",
  lastPostTitle: "{{ site.posts.first.title | escape }}",
  posts: [
    {% for p in site.posts limit:12 %}
    { title: "{{ p.title | escape }}", date: "{{ p.date }}", tags: "{{ p.tags | join: ', ' }}" }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ],
  travelCountries: [
    {% assign seen = '' | split: '' %}
    {% for trip in site.data.travel %}
      {% unless seen contains trip.country %}
    "{{ trip.country }}"{% assign seen = seen | push: trip.country %}{% unless forloop.last %},{% endunless %}
      {% endunless %}
    {% endfor %}
  ]
};
</script>
<script defer src="{{ '/assets/js/vitals.js' | relative_url | bust_file_cache }}"></script>
