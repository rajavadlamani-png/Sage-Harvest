(() => {
  "use strict";

  const panel = document.getElementById("pujaPanel");
  const launcher = document.getElementById("pujaLauncher");
  const close = document.getElementById("pujaClose");

  if (!panel || !launcher) return;

  function openPanelUI() {
    try {
      panel.inert = false;
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
      launcher.setAttribute("aria-expanded", "true");
      window.dispatchEvent(new CustomEvent("puja:open"));
    } catch (error) {
      console.error("Puja UI open error", error);
    }
  }

  function closePanelUI() {
    try {
      window.dispatchEvent(new CustomEvent("puja:close"));
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
      panel.inert = true;
      launcher.setAttribute("aria-expanded", "false");
      launcher.focus();
    } catch (error) {
      console.error("Puja UI close error", error);
    }
  }

  launcher.addEventListener("click", openPanelUI);
  close?.addEventListener("click", closePanelUI);

  window.addEventListener("keydown", event => {
    if (event.key === "Escape" && panel.classList.contains("open")) {
      closePanelUI();
    }
  });

  window.PujaUI = Object.freeze({
    open: openPanelUI,
    close: closePanelUI
  });
})();