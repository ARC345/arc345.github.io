/**
 * Site Vital Signs — CRT Patient Monitor
 * Vanilla JS. Zero dependencies.
 * Parses window.__vitals, renders medical monitor UI + EKG waveform.
 */
(function () {
  'use strict';

  // ── Read vitals data ────────────────────────────────────────────────────
  var V = window.__vitals || {};
  if (!V.postCount && V.postCount !== 0) {
    console.warn('[vitals] No data found');
    return;
  }

  // ── DOM refs ─────────────────────────────────────────────────────────────
  var els = {};
  var ids = [
    'vitals-patient-dob', 'vitals-patient-status',
    'vital-hr-value', 'vital-resp-value', 'vital-temp-value',
    'vital-bp-value', 'vital-spo2-value', 'vital-act-value', 'vital-act-fill',
    'vital-hr-trend', 'vital-resp-trend', 'vital-temp-trend',
    'vital-bp-trend', 'vital-spo2-trend',
    'vitals-ekg-canvas', 'vitals-diagnosis-text', 'vitals-alert-text'
  ];
  ids.forEach(function (id) {
    els[id] = document.getElementById(id);
  });

  var canvas = els['vitals-ekg-canvas'];
  if (!canvas) { console.warn('[vitals] canvas not found'); return; }
  var ctx = canvas.getContext('2d');

  // ── Derived metrics ─────────────────────────────────────────────────────
  var now = new Date();
  var firstPost = V.firstPostDate ? new Date(V.firstPostDate) : now;
  var lastPost = V.lastPostDate ? new Date(V.lastPostDate) : now;
  var siteAgeYears = Math.max(0.5, (now - firstPost) / (365.25 * 24 * 3600 * 1000));
  var siteAgeMonths = siteAgeYears * 12;
  var totalItems = (V.postCount || 0) + (V.projectCount || 0) +
                   (V.travelCount || 0) + (V.newsCount || 0) + (V.bookCount || 0);

  // Heart Rate: post frequency scaled to BPM-like range
  var rawHR = V.postCount > 0
    ? Math.round(Math.min(120, Math.max(40, (V.postCount / siteAgeYears) * 30)))
    : 0;
  // Minimum 40 if any posts exist
  var heartRate = V.postCount > 0 ? Math.max(40, rawHR) : 0;

  // Respiration
  var respiration = Math.round(Math.min(40, Math.max(8, (totalItems / Math.max(6, siteAgeMonths)) * 6)));

  // Temperature
  var daysSinceLastPost = Math.round((now - lastPost) / (24 * 3600 * 1000));
  var temperature;
  if (daysSinceLastPost <= 30) temperature = 41.5;
  else if (daysSinceLastPost <= 90) temperature = 39.5;
  else if (daysSinceLastPost <= 180) temperature = 37.5;
  else temperature = 36.5;
  // Add slight jitter for realism but it's baked into display, not the base value

  // Blood Pressure
  var bpSys = Math.min(160, 110 + (V.postCount || 0) * 5);
  var bpDia = Math.min(100, 60 + (V.travelCount || 0));

  // SpO2
  var o2Sat = Math.round(Math.min(100, Math.max(90, 90 + (V.postCount || 0) * 2)));

  // Activity Score
  var actScore = Math.round(Math.min(100,
    (heartRate / 120) * 30 +
    ((temperature - 36) / 6) * 25 +
    ((o2Sat - 90) / 10) * 20 +
    Math.min(1, (V.postCount || 0) / 5) * 25
  ));

  // ── Status ──────────────────────────────────────────────────────────────
  var statusText = actScore >= 70 ? 'THRIVING'
    : actScore >= 40 ? 'ACTIVE'
    : actScore >= 20 ? 'STABLE'
    : 'STABLE';

  // ── Diagnosis generator ─────────────────────────────────────────────────
  function generateDiagnosis() {
    var parts = [];
    if (actScore >= 60) {
      parts.push('Patient in active research phase.');
    } else if (actScore >= 30) {
      parts.push('Steady maintenance mode. Normal vitals.');
    } else {
      parts.push('Patient in low-power standby.');
    }
    if ((V.travelCount || 0) > 10) {
      parts.push('Chronic wanderlust detected. Geographic diversification of thought patterns.');
    }
    if ((V.postCount || 0) >= 3 && daysSinceLastPost <= 90) {
      parts.push('Recent cognitive output detected. Synaptic plasticity high.');
    }
    if ((V.postCount || 0) >= 2 && (V.projectCount || 0) >= 3) {
      parts.push('Creative hyperthermia suspected. Multiple concurrent thought streams.');
    }
    if ((V.travelCount || 0) > 5 && (V.postCount || 0) > 0) {
      parts.push('Correlation between travel and ideation noted.');
    }
    if (parts.length === 0) parts.push('Awaiting data. No significant activity detected.');
    return parts.join(' ');
  }

  // ── Alert cycler ───────────────────────────────────────────────────────
  function buildAlerts() {
    var alerts = [];
    if (V.lastPostTitle && V.lastPostDate) {
      alerts.push('New post: "' + V.lastPostTitle + '" (' + V.lastPostDate + ')');
    }
    if (V.travelCountries && V.travelCountries.length) {
      alerts.push('Travel detected: ' + V.travelCountries.join(', '));
    }
    if (V.postCount > 0) {
      alerts.push('Posts: ' + V.postCount + ' | Projects: ' + V.projectCount + ' | Travel: ' + V.travelCount);
    }
    if (alerts.length === 0) alerts.push('No recent activity logged.');
    return alerts;
  }

  var alerts = buildAlerts();
  var alertIndex = 0;

  // ── Render initial values ──────────────────────────────────────────────
  function renderValues() {
    if (els['vitals-patient-dob'])
      els['vitals-patient-dob'].textContent = 'DOB: ' + (V.firstPostDate || '--');
    if (els['vitals-patient-status'])
      els['vitals-patient-status'].textContent = 'STATUS: ' + statusText;

    if (els['vital-hr-value'])
      els['vital-hr-value'].textContent = heartRate > 0 ? heartRate : '--';
    if (els['vital-resp-value'])
      els['vital-resp-value'].textContent = respiration;
    if (els['vital-temp-value'])
      els['vital-temp-value'].textContent = temperature.toFixed(1);
    if (els['vital-bp-value'])
      els['vital-bp-value'].textContent = bpSys + '/' + bpDia;
    if (els['vital-spo2-value'])
      els['vital-spo2-value'].textContent = o2Sat;
    if (els['vital-act-value'])
      els['vital-act-value'].textContent = actScore;
    if (els['vital-act-fill'])
      els['vital-act-fill'].style.width = actScore + '%';

    // Trend indicators
    if (els['vital-hr-trend'])
      els['vital-hr-trend'].innerHTML = '<span class="vital-pulse">&#10084;</span> ' + (heartRate > 0 ? 'SINUS' : '--');
    if (els['vital-resp-trend'])
      els['vital-resp-trend'].textContent = respiration > 15 ? 'NORMAL' : 'SHALLOW';
    if (els['vital-temp-trend'])
      els['vital-temp-trend'].textContent = temperature >= 39 ? 'ELEVATED' : temperature >= 37.5 ? 'NORMAL' : 'COOL';
    if (els['vital-bp-trend'])
      els['vital-bp-trend'].textContent = bpSys > 130 ? 'ELEVATED' : 'NORMAL';
    if (els['vital-spo2-trend'])
      els['vital-spo2-trend'].textContent = o2Sat >= 95 ? 'NORMAL' : o2Sat >= 90 ? 'ACCEPTABLE' : 'LOW';
  }

  renderValues();

  // ── Diagnosis text typewriter ──────────────────────────────────────────
  (function showDiagnosis() {
    var el = els['vitals-diagnosis-text'];
    if (!el) return;
    var text = generateDiagnosis();
    var i = 0;
    el.textContent = '';
    function type() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(type, 20 + Math.random() * 30);
      }
    }
    type();
  })();

  // ── Alert cycler ───────────────────────────────────────────────────────
  (function cycleAlerts() {
    var el = els['vitals-alert-text'];
    if (!el || alerts.length <= 1) return;
    el.textContent = alerts[0];
    setInterval(function () {
      alertIndex = (alertIndex + 1) % alerts.length;
      el.textContent = alerts[alertIndex];
    }, 6000);
  })();

  // ── EKG Canvas ─────────────────────────────────────────────────────────
  var W, H;
  var beatInterval = heartRate > 0 ? (60 / heartRate) * 1000 : 1000; // ms between beats
  var lastBeatTime = 0;
  var phase = 0; // 0..1 within each beat cycle

  // Circular buffer for waveform history
  var MAX_POINTS = 500;
  var waveBuffer = [];
  // Initialize with flat line
  for (var i = 0; i < MAX_POINTS; i++) waveBuffer.push(0);

  function resizeCanvas() {
    var container = canvas.parentElement;
    if (!container) return;
    var rect = container.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    W = rect.width;
    H = Math.max(320, rect.height);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawGrid() {
    // Subtle grid: 40px squares
    ctx.strokeStyle = '#0a2a0a';
    ctx.lineWidth = 0.5;
    var gridSize = 40;
    for (var x = 0; x <= W; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (var y = 0; y <= H; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    // Major grid lines (every 5th)
    ctx.strokeStyle = '#0d3d0d';
    ctx.lineWidth = 0.5;
    for (var mx = 0; mx <= W; mx += gridSize * 5) {
      ctx.beginPath();
      ctx.moveTo(mx, 0);
      ctx.lineTo(mx, H);
      ctx.stroke();
    }
    for (var my = 0; my <= H; my += gridSize * 5) {
      ctx.beginPath();
      ctx.moveTo(0, my);
      ctx.lineTo(W, my);
      ctx.stroke();
    }
  }

  function generateBeat(phaseLocal) {
    // phaseLocal: 0..1 representing position within one heartbeat cycle
    // Returns a y-offset (-100 to +100) for the EKG waveform

    // PQRST complex simplified
    // P wave: small bump at ~0.05
    // QRS complex: big spike at ~0.2-0.3
    // T wave: medium bump at ~0.5-0.6

    if (phaseLocal < 0.03) {
      // Isoelectric
      return 0;
    } else if (phaseLocal < 0.08) {
      // P wave: small upward bump
      var p = (phaseLocal - 0.03) / 0.05;
      return Math.sin(p * Math.PI) * 12;
    } else if (phaseLocal < 0.12) {
      // Brief isoelectric
      return 0;
    } else if (phaseLocal < 0.16) {
      // Q wave: small dip
      var q = (phaseLocal - 0.12) / 0.04;
      return -Math.sin(q * Math.PI) * 15;
    } else if (phaseLocal < 0.20) {
      // R wave: massive spike
      var r = (phaseLocal - 0.16) / 0.04;
      return Math.sin(r * Math.PI) * 120;
    } else if (phaseLocal < 0.24) {
      // S wave: deep dip
      var s = (phaseLocal - 0.20) / 0.04;
      return -Math.sin(s * Math.PI) * 40;
    } else if (phaseLocal < 0.34) {
      // ST segment: slight elevation
      var st = (phaseLocal - 0.24) / 0.10;
      return Math.sin(st * Math.PI) * 5;
    } else if (phaseLocal < 0.50) {
      // T wave: medium bump
      var t = (phaseLocal - 0.34) / 0.16;
      return Math.sin(t * Math.PI) * 25;
    } else if (phaseLocal < 0.65) {
      // U wave: tiny bump (sometimes present)
      var u = (phaseLocal - 0.50) / 0.15;
      return Math.sin(u * Math.PI) * 5;
    } else {
      // Isoelectric to end
      return 0;
    }
  }

  function generateWaveformSample(globalPhase) {
    // globalPhase: 0..1 position in current beat cycle
    // Add small baseline wandering
    var baseline = Math.sin(globalPhase * 2 * Math.PI * 0.3) * 1.5;
    // Add small noise
    var noise = (Math.random() - 0.5) * 0.8;

    if (heartRate > 0) {
      var beatVal = generateBeat(globalPhase);
      return beatVal + baseline + noise;
    } else {
      // No heartbeat: flatline with tiny noise
      return baseline * 0.5 + noise * 0.3;
    }
  }

  // ── Animation state ────────────────────────────────────────────────────
  var animFrame = null;
  var running = true;
  var lastFrameTime = 0;
  var scrollOffset = 0;

  function drawEKG(timestamp) {
    if (!running) return;

    if (!lastFrameTime) lastFrameTime = timestamp;
    var dt = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    // Update beat phase
    var beatProgress = heartRate > 0 ? (dt / beatInterval) : 0;
    phase = (phase + beatProgress) % 1.0;

    // Generate new samples and append to buffer
    var samplesPerFrame = Math.max(1, Math.round(dt / beatInterval * 80));
    if (samplesPerFrame > 50) samplesPerFrame = 2; // limit after pauses

    var currentPhase = phase;
    for (var s = 0; s < samplesPerFrame; s++) {
      var samplePhase = (currentPhase - (samplesPerFrame - 1 - s) * beatProgress / samplesPerFrame + 1) % 1.0;
      var val = generateWaveformSample(samplePhase);
      waveBuffer.push(val);
    }
    // Trim buffer
    while (waveBuffer.length > MAX_POINTS) {
      waveBuffer.shift();
    }

    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    // Draw grid
    drawGrid();

    // Draw waveform
    if (heartRate > 0) {
      ctx.strokeStyle = '#00ff41';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ff41';
      ctx.shadowBlur = 4;
    } else {
      ctx.strokeStyle = '#1a4a1a';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    ctx.beginPath();

    var pointsToDraw = waveBuffer.length;
    var startX = Math.max(0, W - pointsToDraw * (W / MAX_POINTS));
    var xStep = (W - startX) / Math.max(1, pointsToDraw - 1);

    // Scale: map -80..+120 to canvas height with padding
    var scaleY = (H - 40) / 200;
    var centerY = H / 2;

    for (var wp = 0; wp < pointsToDraw; wp++) {
      var x = startX + wp * xStep;
      var y = centerY - waveBuffer[wp] * scaleY;
      if (wp === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw "flatline" label if no heart rate
    if (heartRate === 0) {
      ctx.fillStyle = '#1a4a1a';
      ctx.font = '18px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('-- NO SIGNAL --', W / 2, H / 2 - 30);
    }

    animFrame = requestAnimationFrame(drawEKG);
  }

  // ── Visibility handling ────────────────────────────────────────────────
  function handleVisibility() {
    if (document.hidden) {
      running = false;
      if (animFrame) {
        cancelAnimationFrame(animFrame);
        animFrame = null;
      }
    } else {
      running = true;
      lastFrameTime = 0;
      if (!animFrame) {
        animFrame = requestAnimationFrame(drawEKG);
      }
    }
  }

  // ── Init ────────────────────────────────────────────────────────────────
  function init() {
    resizeCanvas();
    animFrame = requestAnimationFrame(drawEKG);

    window.addEventListener('resize', function () {
      resizeCanvas();
    });

    document.addEventListener('visibilitychange', handleVisibility);

    // Re-draw on theme change
    var themeObserver = new MutationObserver(function () {
      // No-op, CRT is always dark
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
