(() => {
  "use strict";
  if (document.getElementById("pujaWidget")) return;
  const markup = `
  <div class="puja-widget" id="pujaWidget" aria-label="Puja AI Assistant">
    <button class="puja-launcher" id="pujaLauncher" type="button" aria-label="Open Puja assistant" aria-expanded="false" aria-controls="pujaPanel">
      <span class="puja-avatar-mini" id="pujaMiniAvatar"><img class="puja-avatar-image" src="assets/img/puja-avatar-reference.jpg?v=20261007-avatar2" alt="Puja, Sage Harvest virtual agent"></span>
      <span class="puja-launcher-label">Ask Puja</span>
    </button>
    <section class="puja-panel" id="pujaPanel" aria-hidden="true" inert>
      <header class="puja-header">
        <div class="puja-identity">
          <div class="puja-avatar" id="pujaAvatar" aria-hidden="true"><span class="puja-avatar-ring"></span><img class="puja-avatar-image" src="assets/img/puja-avatar-reference.jpg?v=20261007-avatar2" alt="Puja, Sage Harvest virtual agent"></div>
          <div><strong>Puja</strong><span id="pujaStatus">Sage Harvest Guide</span></div>
        </div>
        <button class="puja-close" id="pujaClose" type="button" aria-label="Close Puja">×</button>
      </header>
      <div class="puja-messages" id="pujaMessages" aria-live="polite">
        <div class="puja-message puja-message-bot"><div class="puja-message-avatar">P</div><div class="puja-message-content">Hello. I’m Puja, the Sage Harvest guide. Ask me about our services, supply-chain transformation, AI, sustainability, M&amp;A due diligence or international expansion. You can also use the microphone where your browser supports speech recognition.</div></div>
      </div>
      <div class="puja-quick-actions">
        <button type="button" data-puja-question="What does Sage Harvest do?">What is Sage Harvest?</button>
        <button type="button" data-puja-question="Tell me about M&amp;A due diligence.">M&amp;A Due Diligence</button>
        <button type="button" data-puja-question="Tell me about international expansion.">Global Expansion</button>
        <button type="button" data-puja-question="Tell me about AI and data.">AI &amp; Data</button>
      </div>
      <form class="puja-input-area" id="pujaForm">
        <button class="puja-mic" id="pujaMic" type="button" aria-label="Speak to Puja" title="Speak to Puja">🎙</button>
        <input id="pujaInput" type="text" autocomplete="off" placeholder="Ask Puja something..." aria-label="Message Puja">
        <button class="puja-send" type="submit" aria-label="Send message">➤</button>
      </form>
      <footer class="puja-footer"><span>AI-assisted voice · Ready</span><button type="button" id="pujaStopSpeaking">Stop voice</button><small>Puja is an AI-assisted voice guide based on information published on the Sage Harvest website.</small></footer>
    </section>
  </div>`;
  document.body.insertAdjacentHTML("beforeend", markup);
  const script = document.createElement("script");
  script.src = "puja-live-20261006-v3.js?v=20261007-knowledge10";
  script.defer = true;
  document.body.appendChild(script);
})();