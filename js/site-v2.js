/* Work section tabs (Video / Websites) on the homepage. Small and scoped —
   does not touch js/main.js, which already handles nav, reveal, checkout
   and the lead form on every page. */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".work-tab"));
    if (!tabs.length) return;

    var panels = {};
    tabs.forEach(function (tab) {
      var panel = document.getElementById(tab.getAttribute("aria-controls"));
      if (panel) panels[tab.id] = panel;
    });

    function activate(tab) {
      tabs.forEach(function (t) {
        var isActive = t === tab;
        t.setAttribute("aria-selected", isActive ? "true" : "false");
        t.tabIndex = isActive ? 0 : -1;
        var panel = panels[t.id];
        if (panel) panel.classList.toggle("is-active", isActive);
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () { activate(tab); });
      tab.addEventListener("keydown", function (e) {
        var idx = tabs.indexOf(tab);
        if (e.key === "ArrowRight") { e.preventDefault(); tabs[(idx + 1) % tabs.length].focus(); }
        if (e.key === "ArrowLeft") { e.preventDefault(); tabs[(idx - 1 + tabs.length) % tabs.length].focus(); }
      });
    });
  });
})();
