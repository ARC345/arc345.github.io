// Animated avatar sprite for the arc-butler page.
// Spritesheet: Petdex v2 pet format, an 8x11 grid of 192x208 frames, one state per row.
// Exposes window.arcButler.set(state) for looping states and .play(state) for one-shots.
(function () {
  var el = document.getElementById("arc-avatar");
  if (!el) return;

  var SCALE = 0.75;
  var FRAME_W = 192 * SCALE;
  var FRAME_H = 208 * SCALE;

  var STATES = {
    idle: { row: 0, frames: 6, ms: 220 },
    waving: { row: 3, frames: 4, ms: 180 },
    jumping: { row: 4, frames: 5, ms: 140 },
    failed: { row: 5, frames: 8, ms: 160 },
    waiting: { row: 6, frames: 6, ms: 240 },
    running: { row: 7, frames: 6, ms: 120 },
    review: { row: 8, frames: 6, ms: 200 },
  };

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var loopState = "idle";
  var current = "idle";
  var frame = 0;
  var oneShot = false;
  var timer = null;

  function draw() {
    var s = STATES[current];
    el.style.backgroundPosition = -frame * FRAME_W + "px " + -s.row * FRAME_H + "px";
  }

  function schedule() {
    clearTimeout(timer);
    if (reduceMotion || document.hidden) return;
    timer = setTimeout(step, STATES[current].ms);
  }

  function step() {
    var s = STATES[current];
    frame += 1;
    if (frame >= s.frames) {
      frame = 0;
      if (oneShot) {
        oneShot = false;
        current = loopState;
      }
    }
    draw();
    schedule();
  }

  function start(state, isOneShot) {
    if (!STATES[state]) return;
    current = state;
    oneShot = isOneShot;
    frame = 0;
    draw();
    schedule();
  }

  window.arcButler = {
    set: function (state) {
      if (!STATES[state]) return;
      loopState = state;
      if (!oneShot) start(state, false);
    },
    play: function (state) {
      start(state, true);
    },
  };

  document.addEventListener("visibilitychange", schedule);

  start("waving", true);
})();
