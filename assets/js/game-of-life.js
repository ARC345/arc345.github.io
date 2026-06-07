/**
 * Conway's Game of Life — seeded from Arnav's site data.
 * Vanilla JS, Canvas API, zero dependencies.
 */
(function () {
  'use strict';

  // ── Config ───────────────────────────────────────────────────────────────
  var COLS = 60;
  var ROWS = 40;
  var CELL = 12; // px
  var DEFAULT_FPS = 8;

  // ── DOM refs ─────────────────────────────────────────────────────────────
  var canvas = document.getElementById('gol-canvas');
  if (!canvas) { console.error('[gol] canvas not found'); return; }
  var ctx = canvas.getContext('2d');
  var toggleBtn = document.getElementById('gol-toggle');
  var clearBtn = document.getElementById('gol-clear');
  var randomBtn = document.getElementById('gol-random');
  var speedInput = document.getElementById('gol-speed');
  var speedVal = document.getElementById('gol-speed-val');
  var genDisplay = document.getElementById('gol-gen');

  canvas.width = COLS * CELL;
  canvas.height = ROWS * CELL;

  // ── State ────────────────────────────────────────────────────────────────
  var grid = [];
  var age = [];   // parallel array: how many generations each cell has lived
  var running = false;
  var generation = 0;
  var fps = DEFAULT_FPS;
  var rafId = null;
  var lastFrame = 0;

  // ── CSS theme colours ──────────────────────────────────────────────────
  function getCSSVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function readTheme() {
    return {
      bg: getCSSVar('--global-bg-color') || '#ffffff',
      text: getCSSVar('--global-text-color') || '#333333',
      theme: getCSSVar('--global-theme-color') || '#0066cc',
    };
  }

  // ── Grid helpers ───────────────────────────────────────────────────────
  function createGrid(fillFn) {
    var g = [];
    var a = [];
    for (var y = 0; y < ROWS; y++) {
      g[y] = [];
      a[y] = [];
      for (var x = 0; x < COLS; x++) {
        g[y][x] = fillFn ? fillFn(x, y) : 0;
        a[y][x] = 0;
      }
    }
    return { grid: g, age: a };
  }

  function randomFill() { return Math.random() < 0.15 ? 1 : 0; }
  function emptyFill() { return 0; }

  function resetState(fillFn) {
    var s = createGrid(fillFn || emptyFill);
    grid = s.grid;
    age = s.age;
    generation = 0;
    if (genDisplay) genDisplay.textContent = 'gen 0';
  }

  // ── Seeding from site data ─────────────────────────────────────────────
  function seedFromData() {
    resetState(emptyFill);
    var seed = window.__lifeSeed;
    if (!seed) {
      // Fallback: just random
      resetState(randomFill);
      return;
    }
    // Map travel coordinates to grid cells
    if (seed.travelCoords && seed.travelCoords.length) {
      seed.travelCoords.forEach(function (t) {
        // lng: -180..180 → x: 0..COLS-1
        var x = Math.round(((t.lng + 180) / 360) * (COLS - 1));
        // lat: -90..90 → y: 0..ROWS-1 (invert so north is top)
        var y = Math.round(((90 - t.lat) / 180) * (ROWS - 1));
        x = Math.max(0, Math.min(COLS - 1, x));
        y = Math.max(0, Math.min(ROWS - 1, y));
        grid[y][x] = 1;
        age[y][x] = 1;
      });
    }
    // Scatter some additional random cells
    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) {
        if (grid[y][x] === 0 && Math.random() < 0.10) {
          grid[y][x] = 1;
          age[y][x] = 1;
        }
      }
    }
  }

  // ── Game logic (toroidal / wrap-around) ────────────────────────────────
  function countNeighbors(g, x, y) {
    var count = 0;
    for (var dy = -1; dy <= 1; dy++) {
      for (var dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        var nx = (x + dx + COLS) % COLS;
        var ny = (y + dy + ROWS) % ROWS;
        count += g[ny][nx];
      }
    }
    return count;
  }

  function step() {
    var newGrid = [];
    var newAge = [];
    for (var y = 0; y < ROWS; y++) {
      newGrid[y] = [];
      newAge[y] = [];
      for (var x = 0; x < COLS; x++) {
        var n = countNeighbors(grid, x, y);
        var alive = grid[y][x];
        var next = 0;
        var a = 0;
        if (alive) {
          if (n === 2 || n === 3) {
            next = 1;
            a = age[y][x] + 1;
          }
        } else {
          if (n === 3) {
            next = 1;
            a = 1;
          }
        }
        newGrid[y][x] = next;
        newAge[y][x] = a;
      }
    }
    grid = newGrid;
    age = newAge;
    generation++;
    if (genDisplay) genDisplay.textContent = 'gen ' + generation;
  }

  // ── Rendering ──────────────────────────────────────────────────────────
  function draw() {
    var theme = readTheme();
    var w = canvas.width;
    var h = canvas.height;

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, w, h);

    // Grid lines (subtle)
    ctx.strokeStyle = theme.text;
    ctx.globalAlpha = 0.06;
    ctx.lineWidth = 0.5;
    for (var x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, h);
      ctx.stroke();
    }
    for (var y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(w, y * CELL);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Cells
    for (var cy = 0; cy < ROWS; cy++) {
      for (var cx = 0; cx < COLS; cx++) {
        if (!grid[cy][cx]) continue;
        var cellAge = age[cy][cx] || 1;
        // Newborn cells are brighter, older cells slightly dimmer
        var brightness = Math.max(0.5, 1 - (cellAge - 1) * 0.008);
        ctx.globalAlpha = brightness;
        ctx.shadowColor = theme.theme;
        ctx.shadowBlur = 3;

        // Parse the theme colour to apply brightness
        ctx.fillStyle = theme.theme;

        var pad = 1;
        ctx.fillRect(cx * CELL + pad, cy * CELL + pad, CELL - pad * 2, CELL - pad * 2);
      }
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // ── Game loop ──────────────────────────────────────────────────────────
  function loop(timestamp) {
    if (!running) return;
    var interval = 1000 / fps;
    if (timestamp - lastFrame >= interval) {
      step();
      draw();
      lastFrame = timestamp;
    }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    lastFrame = performance.now();
    if (toggleBtn) toggleBtn.textContent = '\u23F8 Pause';
    rafId = requestAnimationFrame(loop);
  }

  function pause() {
    running = false;
    if (toggleBtn) toggleBtn.textContent = '\u25B6 Start';
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function toggle() {
    if (running) pause(); else start();
  }

  // ── Controls ───────────────────────────────────────────────────────────
  function handleToggle() { toggle(); }

  function handleClear() {
    var wasRunning = running;
    if (wasRunning) pause();
    resetState(emptyFill);
    draw();
  }

  function handleRandom() {
    var wasRunning = running;
    if (wasRunning) pause();
    seedFromData();
    draw();
  }

  function handleSpeedChange() {
    fps = parseInt(speedInput.value, 10);
    if (speedVal) speedVal.textContent = fps;
  }

  // ── Canvas click: toggle cell ─────────────────────────────────────────
  function handleCanvasClick(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var mx = (e.clientX - rect.left) * scaleX;
    var my = (e.clientY - rect.top) * scaleY;
    var x = Math.floor(mx / CELL);
    var y = Math.floor(my / CELL);
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;
    grid[y][x] = grid[y][x] ? 0 : 1;
    age[y][x] = grid[y][x] ? 1 : 0;
    draw();
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────
  function handleKeydown(e) {
    // Don't intercept when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      toggle();
    } else if (e.key === 'c' || e.key === 'C') {
      handleClear();
    } else if (e.key === 'r' || e.key === 'R') {
      handleRandom();
    }
  }

  // ── Init ───────────────────────────────────────────────────────────────
  function init() {
    seedFromData();
    draw();

    if (toggleBtn) toggleBtn.addEventListener('click', handleToggle);
    if (clearBtn) clearBtn.addEventListener('click', handleClear);
    if (randomBtn) randomBtn.addEventListener('click', handleRandom);
    if (speedInput) speedInput.addEventListener('input', handleSpeedChange);
    canvas.addEventListener('click', handleCanvasClick);
    document.addEventListener('keydown', handleKeydown);

    // Re-draw on theme change (dark/light toggle)
    var themeObserver = new MutationObserver(function () {
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
