/**
 * Site Sonar — Submarine-style radar for content discovery.
 * Vanilla JS. Zero dependencies.
 *
 * Sweeps through posts, projects, and books displayed as radar blips.
 * Hover reveals titles, click navigates. Blips are refreshed as the
 * radar beam passes over them — just like a real maritime radar.
 *
 * Data is injected via Jekyll Liquid into window.__sonarData.
 */
(function () {
  'use strict';

  var DATA = window.__sonarData || {};
  if (!DATA.posts && !DATA.projects && !DATA.books) {
    console.warn('[sonar] No data found');
    return;
  }

  // ── DOM refs ──────────────────────────────────────────────────────────────
  var container = document.getElementById('sonar-container');
  var canvas = document.getElementById('sonar-canvas');
  var tooltip = document.getElementById('sonar-tooltip');
  if (!container || !canvas) { console.warn('[sonar] DOM not found'); return; }
  var ctx = canvas.getContext('2d');

  // ── Blip colours by type ──────────────────────────────────────────────────
  var COLORS = {
    post:    '#00bcd4',
    project: '#8bc34a',
    book:    '#ffd700',
  };
  var TYPE_LABELS = {
    post:    'post',
    project: 'project',
    book:    'book',
  };

  // ── Build blips from Jekyll data ──────────────────────────────────────────
  function hashAngle(str) {
    // Simple string hash → 0..2π (deterministic per title)
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return ((h % 1000) / 1000) * Math.PI * 2;
  }

  function parseDateSafe(d) {
    if (!d) return Date.now();
    var ts = Date.parse(d);
    return isNaN(ts) ? Date.now() : ts;
  }

  var allItems = [];
  var minDate = Infinity, maxDate = -Infinity;

  function addItems(list, type) {
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var ts = parseDateSafe(item.date || item.finished || item.started);
      if (ts < minDate) minDate = ts;
      if (ts > maxDate) maxDate = ts;
      allItems.push({ item: item, type: type, ts: ts });
    }
  }

  addItems(DATA.posts, 'post');
  addItems(DATA.projects, 'project');
  addItems(DATA.books, 'book');

  if (allItems.length === 0) {
    console.warn('[sonar] No content to display');
    return;
  }

  var dateRange = Math.max(1, maxDate - minDate);
  var blips = [];

  for (var ai = 0; ai < allItems.length; ai++) {
    var entry = allItems[ai];
    var item = entry.item;
    var angle = hashAngle(item.title || item.name || '');
    // recency: 0 = oldest, 1 = newest
    var recency = (entry.ts - minDate) / dateRange;
    // newer content appears closer to center (inner rings)
    var distFactor = 0.18 + 0.62 * (1 - recency);

    blips.push({
      angle: angle,
      distFactor: distFactor,
      title: item.title || item.name || 'untitled',
      url: item.url || item.permalink || '#',
      type: entry.type,
      lastSwept: 0,
    });
  }

  // ── Canvas sizing ─────────────────────────────────────────────────────────
  var SIZE, CENTER, RADIUS, DPR;

  function resize() {
    var rect = container.getBoundingClientRect();
    var sz = Math.min(rect.width, window.innerHeight * 0.7 || 600);
    if (sz < 100) sz = 400;
    DPR = window.devicePixelRatio || 1;
    SIZE = sz;
    CENTER = sz / 2;
    RADIUS = sz * 0.42;
    canvas.width = sz * DPR;
    canvas.height = sz * DPR;
    canvas.style.width = sz + 'px';
    canvas.style.height = sz + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  resize();

  // ── Theme reading ─────────────────────────────────────────────────────────
  function readTheme() {
    return {
      bg:      getComputedStyle(document.documentElement)
               .getPropertyValue('--global-bg-color').trim() || '#ffffff',
      text:    getComputedStyle(document.documentElement)
               .getPropertyValue('--global-text-color').trim() || '#333333',
      theme:   getComputedStyle(document.documentElement)
               .getPropertyValue('--global-theme-color').trim() || '#0066cc',
    };
  }

  // ── Animation state ──────────────────────────────────────────────────────
  var sweepAngle = 0;
  var prevSweepAngle = 0;
  var sweepSpeed = 0.006;     // radians per frame (slow, ~17s per revolution)
  var SWEEP_WIDTH = 0.20;     // radar beam angular width (radians, ~11.5 deg)
  var FADE_DURATION = 5000;   // ms blip stays visible after being swept
  var running = true;
  var animId = null;

  // ── Tooltip / hover ──────────────────────────────────────────────────────
  var hoveredBlip = null;

  function getBlipCanvasPos(b) {
    return {
      x: CENTER + Math.sin(b.angle) * RADIUS * b.distFactor,
      y: CENTER - Math.cos(b.angle) * RADIUS * b.distFactor,
    };
  }

  if (tooltip) {
    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      var scale = SIZE / rect.width;
      var mx = (e.clientX - rect.left) * scale;
      var my = (e.clientY - rect.top) * scale;

      hoveredBlip = null;
      for (var i = 0; i < blips.length; i++) {
        var b = blips[i];
        var pos = getBlipCanvasPos(b);
        var dx = mx - pos.x;
        var dy = my - pos.y;
        if (dx * dx + dy * dy < 400) { // 20px radius
          hoveredBlip = b;
          break;
        }
      }

      if (hoveredBlip) {
        var now = performance.now();
        var elapsed = now - hoveredBlip.lastSwept;
        if (elapsed < FADE_DURATION * 1.5) {
          tooltip.style.display = 'block';
          tooltip.style.left = (mx + 14) + 'px';
          tooltip.style.top = (my - 8) + 'px';
          tooltip.innerHTML =
            '<span class="sonar-tt-type" style="color:' +
            COLORS[hoveredBlip.type] + '">' +
            TYPE_LABELS[hoveredBlip.type] +
            '</span> ' +
            hoveredBlip.title;
        } else {
          tooltip.style.display = 'none';
        }
      } else {
        tooltip.style.display = 'none';
      }
    });

    canvas.addEventListener('mouseleave', function () {
      hoveredBlip = null;
      tooltip.style.display = 'none';
    });

    canvas.addEventListener('click', function () {
      if (hoveredBlip && hoveredBlip.url && hoveredBlip.url !== '#') {
        window.location.href = hoveredBlip.url;
      }
    });
  }

  // ── Drawing helpers ──────────────────────────────────────────────────────
  function drawBackground() {
    // Radar always uses a dark screen (like a real CRT radar)
    ctx.fillStyle = '#06060e';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Subtle outer glow
    var grad = ctx.createRadialGradient(
      CENTER, CENTER, RADIUS * 0.92,
      CENTER, CENTER, RADIUS * 1.05
    );
    grad.addColorStop(0, 'rgba(0,180,200,0)');
    grad.addColorStop(0.8, 'rgba(0,180,200,0.02)');
    grad.addColorStop(1, 'rgba(0,180,200,0.10)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS * 1.05, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRings() {
    // Concentric distance rings
    ctx.strokeStyle = 'rgba(0,160,200,0.12)';
    ctx.lineWidth = 0.5;

    for (var r = 0.25; r <= 1.0; r += 0.25) {
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, RADIUS * r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Outer ring, brighter
    ctx.strokeStyle = 'rgba(0,180,200,0.30)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawCrosshairs() {
    ctx.strokeStyle = 'rgba(0,160,200,0.06)';
    ctx.lineWidth = 0.5;

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER - RADIUS);
    ctx.lineTo(CENTER, CENTER + RADIUS);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(CENTER - RADIUS, CENTER);
    ctx.lineTo(CENTER + RADIUS, CENTER);
    ctx.stroke();

    // Diagonal lines (45°)
    var diag = RADIUS * 0.7071;
    ctx.beginPath();
    ctx.moveTo(CENTER - diag, CENTER - diag);
    ctx.lineTo(CENTER + diag, CENTER + diag);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(CENTER + diag, CENTER - diag);
    ctx.lineTo(CENTER - diag, CENTER + diag);
    ctx.stroke();

    // Centre dot
    ctx.fillStyle = 'rgba(0,180,200,0.5)';
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBlips(now) {
    for (var i = 0; i < blips.length; i++) {
      var b = blips[i];
      var elapsed = now - b.lastSwept;
      var alpha = Math.max(0, 1 - elapsed / FADE_DURATION);
      if (alpha < 0.015) continue;

      var pos = getBlipCanvasPos(b);
      var color = COLORS[b.type];

      // Outer glow ring
      ctx.save();
      ctx.globalAlpha = alpha * 0.25;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Inner blip dot
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Highlight ring (for recently swept blips)
      if (alpha > 0.5) {
        ctx.save();
        ctx.globalAlpha = (alpha - 0.5) * 0.5;
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function drawSweep(now) {
    // Radar beam — a triangular fade behind the leading sweep line.
    // Draw multiple radial line segments with decreasing opacity.
    var beamEnd = sweepAngle;
    var beamStart = sweepAngle - SWEEP_WIDTH;

    // Draw beam as overlapping radial lines
    var steps = 20;
    for (var i = 0; i < steps; i++) {
      var t = i / steps;
      var a = beamStart + t * SWEEP_WIDTH;
      var alpha = 0.12 * (1 - t * 0.85);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = 'rgba(0,200,220,1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER);
      var ex = CENTER + Math.sin(a) * RADIUS;
      var ey = CENTER - Math.cos(a) * RADIUS;
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.restore();
    }

    // Bright leading edge
    ctx.save();
    ctx.strokeStyle = 'rgba(0,220,240,0.7)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(0,220,240,0.4)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    var lx = CENTER + Math.sin(sweepAngle) * RADIUS;
    var ly = CENTER - Math.cos(sweepAngle) * RADIUS;
    ctx.lineTo(lx, ly);
    ctx.stroke();
    ctx.restore();

    // Leading edge dot
    ctx.save();
    ctx.fillStyle = 'rgba(0,240,255,0.6)';
    ctx.shadowColor = 'rgba(0,240,255,0.3)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(lx, ly, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHeadingLabels() {
    // Cardinal direction labels
    ctx.save();
    ctx.fillStyle = 'rgba(0,160,200,0.25)';
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    var labels = [
      { text: 'N', x: CENTER, y: CENTER - RADIUS - 14 },
      { text: 'S', x: CENTER, y: CENTER + RADIUS + 14 },
      { text: 'E', x: CENTER + RADIUS + 14, y: CENTER },
      { text: 'W', x: CENTER - RADIUS - 14, y: CENTER },
    ];

    for (var i = 0; i < labels.length; i++) {
      ctx.fillText(labels[i].text, labels[i].x, labels[i].y);
    }
    ctx.restore();
  }

  // ── Sweep detection ───────────────────────────────────────────────────────
  function updateSwept(now) {
    for (var i = 0; i < blips.length; i++) {
      var b = blips[i];
      var diff = sweepAngle - b.angle;

      // Normalize diff to [-π, π]
      while (diff > Math.PI)  diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;

      // Blip is "illuminated" if it falls within the beam width behind the sweep
      if (diff >= -SWEEP_WIDTH && diff <= 0) {
        b.lastSwept = now;
      }
    }
  }

  // ── Animation loop ────────────────────────────────────────────────────────
  function loop(timestamp) {
    if (!running) return;
    var now = performance.now();

    // Update sweep angle
    prevSweepAngle = sweepAngle;
    sweepAngle += sweepSpeed;
    if (sweepAngle > Math.PI * 2) sweepAngle -= Math.PI * 2;

    // Update which blips are illuminated
    updateSwept(now);

    // Read theme (for tooltip text colour, though radar is always dark)
    var theme = readTheme();

    // Draw
    drawBackground();
    drawRings();
    drawCrosshairs();
    drawHeadingLabels();
    drawBlips(now);
    drawSweep(now);

    animId = requestAnimationFrame(loop);
  }

  // ── Visibility handling ───────────────────────────────────────────────────
  function handleVisibility() {
    if (document.hidden) {
      running = false;
      if (animId) { cancelAnimationFrame(animId); animId = null; }
    } else {
      running = true;
      if (!animId) animId = requestAnimationFrame(loop);
    }
  }

  // ── Resize ────────────────────────────────────────────────────────────────
  function handleResize() {
    resize();
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    resize();

    // Stagger initial lastSwept so blips appear one-by-one
    var now = performance.now();
    for (var i = 0; i < blips.length; i++) {
      blips[i].lastSwept = now - FADE_DURATION * 1.2 +
        (i / blips.length) * FADE_DURATION * 0.6;
    }

    animId = requestAnimationFrame(loop);

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibility);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
