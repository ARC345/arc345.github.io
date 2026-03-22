$(document).ready(function () {
  var wrappers = [];

  $(".language-chartjs").each(function () {
    var $code = $(this);
    var $pre = $code.parent("pre");
    var _text = $code.text();
    var config = JSON.parse(_text);
    var isRadar = config.type === "radar";

    var $wrapper = $('<div style="position:relative"></div>');
    if (isRadar) {
      $wrapper.addClass("chartjs-radar");
      $wrapper.css({ width: "100%", maxWidth: "450px" });
    } else {
      $wrapper.css("width", "100%");
    }

    var $canvas = $("<canvas></canvas>");
    $wrapper.append($canvas);
    $pre.replaceWith($wrapper);

    wrappers.push({ el: $wrapper, isRadar: isRadar });

    var _ctx = $canvas.get(0).getContext("2d");
    if (_ctx) {
      new Chart(_ctx, config);
    }
  });

  // Group consecutive radar charts side by side
  for (var i = 0; i < wrappers.length; i++) {
    if (
      wrappers[i].isRadar &&
      i + 1 < wrappers.length &&
      wrappers[i + 1].isRadar
    ) {
      var $first = wrappers[i].el;
      var $second = wrappers[i + 1].el;
      // Only group if they are adjacent siblings
      if ($first.next().is($second)) {
        var $flex = $(
          '<div style="display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;width:100%"></div>'
        );
        $first.before($flex);
        $flex.append($first).append($second);
        $first.css("flex", "1 1 300px");
        $second.css("flex", "1 1 300px");
        i++; // skip the next one since it's already grouped
      }
    }
  }
});
