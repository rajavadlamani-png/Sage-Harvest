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
      window.clearTimeout(window.__pujaReadyTimer);
      window.__pujaReadyTimer = window.setTimeout(() => {
        if (!window.PujaLiveReady && panel.classList.contains("open")) {
          const messages = document.getElementById("pujaMessages");
          const status = document.getElementById("pujaStatus");
          if (status) status.textContent = "Puja · voice unavailable";
          if (messages && !messages.querySelector("[data-puja-system-error]")) {
            const row = document.createElement("div");
            row.className = "puja-message puja-message-bot";
            row.setAttribute("data-puja-system-error", "true");
            const body = document.createElement("div");
            body.className = "puja-message-content";
            body.textContent = "Puja voice is temporarily unavailable. Please try again in a moment.";
            row.appendChild(body);
            messages.appendChild(row);
            messages.scrollTop = messages.scrollHeight;
          }
          console.error("Puja Live did not become ready after the panel opened.");
        }
      }, 8000);
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