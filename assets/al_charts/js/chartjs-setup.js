/* Replace each `chartjs` code block with a rendered Chart.js canvas, and lay out
   consecutive radar charts side by side.
   Overrides the al_charts gem's chartjs-setup.js (see _plugins/al_charts_overrides.rb).
   Runs at full load so the deferred Chart.js CDN script is available.
   Vanilla JS (no jQuery) — jQuery is not loaded in al-folio v1. */
document.addEventListener("readystatechange", () => {
  if (document.readyState !== "complete") return;

  const wrappers = [];

  document.querySelectorAll(".language-chartjs").forEach((code) => {
    const text = code.textContent;
    if (!text) return;
    const config = JSON.parse(text);
    const isRadar = config.type === "radar";

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.width = "100%";
    if (isRadar) {
      wrapper.classList.add("chartjs-radar");
      wrapper.style.maxWidth = "450px";
    }

    const canvas = document.createElement("canvas");
    wrapper.appendChild(canvas);
    const pre = code.closest("pre") || code;
    pre.replaceWith(wrapper);

    wrappers.push({ el: wrapper, isRadar: isRadar });

    const ctx = canvas.getContext("2d");
    if (ctx) {
      new Chart(ctx, config);
    }
  });

  // Group consecutive radar charts side by side
  for (let i = 0; i < wrappers.length; i++) {
    if (wrappers[i].isRadar && i + 1 < wrappers.length && wrappers[i + 1].isRadar) {
      const first = wrappers[i].el;
      const second = wrappers[i + 1].el;
      // Only group if they are adjacent siblings
      if (first.nextElementSibling === second) {
        const flex = document.createElement("div");
        flex.style.cssText = "display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;width:100%";
        first.before(flex);
        flex.append(first, second);
        first.style.flex = "1 1 300px";
        second.style.flex = "1 1 300px";
        i++; // skip the next one since it's already grouped
      }
    }
  }
});
