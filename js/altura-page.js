/* Revenue Pilots — standalone ALTURA concept demo bootstrap.
   External file keeps the demo compatible with the production CSP. */
(function () {
  "use strict";
  function mount() {
    var root = document.getElementById("alturaRoot");
    if (!root || !window.RPAltura) return;
    window.RPAltura.mount(root, { size: "full", canvas: true, interactive: true });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
