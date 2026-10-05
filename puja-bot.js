(() => {
  "use strict";

  const CONFIG = {
    name: "Puja",
    language: "en-IN",
    speechRate: 0.96,
    speechPitch: 1.05,
    autoSpeak: true,
    autoGreetingDelay: 3500
  };

  const KNOWLEDGE = [
    { id: "welcome", keywords: ["hello", "hi", "help", "what can you do", "who are you", "puja"], answer: "Hello, I’m Puja, the virtual agent for Sage Harvest. I can help you understand what Sage Harvest does, explain our services and guide you to the right part of the website." },
    { id: "sage-harvest", keywords: ["sage harvest", "what is sage harvest", "about sage harvest", "what do you do", "what does sage harvest do", "company"], answer: "Sage Harvest Agro is an independent, practitioner-led advisory firm for seed and agri-business supply chains. The website covers supply-chain transformation, Digital and AI, sustainability, due diligence and international expansion." },
    { id: "services", keywords: ["services", "service", "consulting", "advisory", "what services", "what do you offer"], answer: "Sage Harvest focuses on supply-chain transformation, Digital and AI, sustainability and climate, M&A supply-chain due diligence, operational risk assessment, and international expansion and cross-border trade." },
    { id: "supply-chain", keywords: ["supply chain", "supply-chain", "seed supply chain", "transformation", "production planning", "processing", "warehousing", "inventory", "logistics", "traceability"], answer: "Sage Harvest looks at the seed supply chain as a connected system, covering production planning, processing, quality, warehousing, inventory, logistics, traceability and operating-model improvement." },
    { id: "digital-ai", keywords: ["digital", "digital ai", "ai", "artificial intelligence", "machine learning", "regression", "forecasting", "analytics", "satellite", "weather", "data"], answer: "The Digital and AI work described by Sage Harvest includes AI and machine learning, forecasting and analytics, satellite and weather intelligence, traceability and decision-support systems for modern agricultural supply chains." },
    { id: "sustainability", keywords: ["sustainability", "climate", "carbon", "mrv", "climate resilience", "climate smart", "resource efficiency"], answer: "Sage Harvest's sustainability perspective connects climate resilience and resource efficiency with supply-chain performance. The website also covers carbon and MRV-oriented approaches and sustainability assessment." },
    { id: "ma", keywords: ["m&a", "merger", "acquisition", "acquisitions", "due diligence", "operational risk", "transaction", "investor"], answer: "Sage Harvest provides supply-chain due diligence and operational-risk assessment for management teams, investors and transaction teams. The focus is on understanding the operational reality behind the numbers, including production, infrastructure, inventory, quality and operating risks." },
    { id: "international", keywords: ["international", "global", "export", "cross border", "cross-border", "india africa", "africa", "trade", "market entry", "partner"], answer: "Sage Harvest supports organizations exploring international markets, export opportunities, strategic partnerships and cross-border supply chains. The emerging international focus includes market intelligence, commercial strategy, partner facilitation and execution." },
    { id: "founder", keywords: ["founder", "raja", "raja vadlamani", "who is raja", "principal advisor"], answer: "Raja Vadlamani is the Founder and Principal Advisor of Sage Harvest. The website describes nearly four decades across the seed and agri-business ecosystem, including experience with Corteva, Advanta, Shriram Bioseed and SeedWorks International." },
    { id: "insights", keywords: ["insights", "articles", "article", "writing", "publications", "thought leadership", "linkedin", "read"], answer: "Sage Harvest's Insights section is intended to share practical perspectives on seed supply chains, AI, sustainability, industry transformation and related topics. You can use the Insights link in the main navigation to explore the published material." },
    { id: "youtube", keywords: ["youtube", "video", "videos", "supply chain with raja", "watch", "channel"], answer: "Sage Harvest also has a video knowledge platform called Supply Chain With Raja, covering supply chains, seed, AI, sustainability and industry transformation. The website provides a link to the YouTube channel." },
    { id: "labs", keywords: ["labs", "lab", "projects", "experiments", "tools", "innovation"], answer: "The Labs section is the space for practical experiments, tools and emerging ideas from Sage Harvest. You can open Labs from the main website navigation." },
    { id: "case-perspectives", keywords: ["case studies", "case perspectives", "cases", "experience", "projects", "greenfield", "case"], answer: "Case Perspectives presents practical experience and perspectives from seed and agri-business supply chains, including transformation, planning, technology, sustainability and operational challenges." },
    { id: "contact", keywords: ["contact", "email", "phone", "talk to us", "engage", "get in touch", "conversation"], answer: "If you would like to discuss an opportunity with Sage Harvest, use the Talk to Us or Contact section in the website navigation." }
  ];

  const ROUTES = { services: "services.html", "digital-ai": "digital-ai.html", sustainability: "sustainability.html", ma: "ma-due-diligence.html", international: "international-expansion.html", founder: "founder.html", insights: "insights.html", youtube: "https://www.youtube.com/@rajavadlamani", labs: "labs.html", "case-perspectives": "case-studies.html", contact: "contact.html" };

  const $ = id => document.getElementById(id);
  const panel = $("pujaPanel");
  const launcher = $("pujaLauncher");
  const close = $("pujaClose");
  const form = $("pujaForm");
  const input = $("pujaInput");
  const messages = $("pujaMessages");
  const mic = $("pujaMic");
  const avatar = $("pujaAvatar");
  const miniAvatar = $("pujaMiniAvatar");
  const status = $("pujaStatus");
  const stop = $("pujaStopSpeaking");

  if (!panel || !launcher || !form || !input || !messages) return;

  function openPuja() {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    launcher.setAttribute("aria-expanded", "true");
    setTimeout(() => input.focus(), 100);
  }

  function closePuja() {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    launcher.setAttribute("aria-expanded", "false");
  }

  launcher.addEventListener("click", () => panel.classList.contains("open") ? closePuja() : openPuja());
  close?.addEventListener("click", closePuja);

  function addMessage(text, sender = "bot") {
    const message = document.createElement("div");
    message.className = `puja-message puja-message-${sender}`;
    if (sender === "bot") {
      const a = document.createElement("div");
      a.className = "puja-message-avatar";
      a.textContent = "P";
      message.appendChild(a);
    }
    const content = document.createElement("div");
    content.className = "puja-message-content";
    content.textContent = text;
    message.appendChild(content);
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
  let voices = [];
  let pujaVoice = null;

  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices();
    const languages = ["en-IN", "en-US", "en-GB"];
    for (const language of languages) {
      const candidates = voices.filter(v => v.lang.toLowerCase().startsWith(language.toLowerCase()));
      if (candidates.length) {
        pujaVoice = candidates.find(v => /female|zira|samantha|susan|heera|google.*female/i.test(v.name)) || candidates[0];
        break;
      }
    }
    pujaVoice ||= voices.find(v => v.lang.toLowerCase().startsWith("en")) || voices[0] || null;
  }

  loadVoices();
  synth?.addEventListener("voiceschanged", loadVoices);

  function setAvatarState(state) {
    avatar?.classList.remove("listening", "speaking");
    miniAvatar?.classList.remove("listening", "speaking");
    if (state === "listening" || state === "speaking") {
      avatar?.classList.add(state);
      miniAvatar?.classList.add(state);
    }
  }

  function stopSpeaking() {
    synth?.cancel();
    setAvatarState("idle");
    if (status) status.textContent = "Sage Harvest Guide";
  }

  function speak(text) {
    if (!synth || !CONFIG.autoSpeak) return;
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = CONFIG.language;
    utterance.rate = CONFIG.speechRate;
    utterance.pitch = CONFIG.speechPitch;
    if (pujaVoice) utterance.voice = pujaVoice;
    utterance.onstart = () => { setAvatarState("speaking"); if (status) status.textContent = "Puja is speaking"; };
    utterance.onend = () => { setAvatarState("idle"); if (status) status.textContent = "Sage Harvest Guide"; };
    utterance.onerror = () => { setAvatarState("idle"); if (status) status.textContent = "Sage Harvest Guide"; };
    synth.speak(utterance);
  }

  stop?.addEventListener("click", stopSpeaking);

  function normalize(text) { return text.toLowerCase().replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim(); }

  function scoreEntry(query, entry) {
    const q = normalize(query);
    let score = 0;
    entry.keywords.forEach(keyword => { const k = normalize(keyword); if (q.includes(k)) score += k.includes(" ") ? 5 : 2; });
    return score;
  }

  function findBest(query) {
    let best = null;
    let bestScore = 0;
    KNOWLEDGE.forEach(entry => { const score = scoreEntry(query, entry); if (score > bestScore) { best = entry; bestScore = score; } });
    return { entry: best, score: bestScore };
  }

  function addNavigation(id) {
    const href = ROUTES[id];
    if (!href) return;
    const link = document.createElement("a");
    link.href = href;
    link.textContent = id === "youtube" ? "Open Supply Chain With Raja →" : "Open the relevant Sage Harvest page →";
    link.className = "puja-inline-link";
    link.target = href.startsWith("http") ? "_blank" : "_self";
    if (href.startsWith("http")) link.rel = "noopener";
    const wrapper = document.createElement("div");
    wrapper.className = "puja-navigation-link";
    wrapper.appendChild(link);
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  }

  function route(query) {
    const result = findBest(query);
    if (result.entry && result.score >= 2) return { text: result.entry.answer, id: result.entry.id };
    return { text: "I’m here to help you explore Sage Harvest. You can ask me what Sage Harvest does, about our services, Digital and AI, sustainability, M&A due diligence, international expansion, Raja Vadlamani, our Insights, Labs or Supply Chain With Raja." };
  }

  function process(query) {
    const clean = query.trim();
    if (!clean) return;
    addMessage(clean, "user");
    const response = route(clean);
    addMessage(response.text, "bot");
    if (response.id && ROUTES[response.id]) addNavigation(response.id);
    speak(response.text);
  }

  form.addEventListener("submit", event => { event.preventDefault(); process(input.value); input.value = ""; });

  document.querySelectorAll("[data-puja-question]").forEach(button => {
    button.addEventListener("click", () => { openPuja(); process(button.dataset.pujaQuestion || ""); });
  });

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let listening = false;

  if (SpeechRecognition && mic) {
    recognition = new SpeechRecognition();
    recognition.lang = CONFIG.language;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => { listening = true; mic.classList.add("active"); setAvatarState("listening"); if (status) status.textContent = "Listening..."; };
    recognition.onresult = event => { const transcript = event.results[0][0].transcript; process(transcript); };
    recognition.onerror = event => {
      const message = event.error === "not-allowed" ? "Microphone permission was not granted. Please allow microphone access in your browser." : event.error === "no-speech" ? "I didn't hear anything. Please try again." : "I couldn't understand the microphone input. You can also type your question.";
      addMessage(message);
    };
    recognition.onend = () => { listening = false; mic.classList.remove("active"); setAvatarState("idle"); if (status) status.textContent = "Sage Harvest Guide"; };
    mic.addEventListener("click", () => {
      if (listening) { recognition.stop(); return; }
      stopSpeaking();
      try { recognition.start(); } catch (error) { console.warn("Puja speech recognition could not start", error); }
    });
  } else if (mic) {
    mic.disabled = true;
    mic.title = "Speech recognition is not supported in this browser.";
  }

  // A gentle first-visit greeting: the panel remains closed, but Puja introduces herself.
  // Speech is intentionally NOT automatic because browsers commonly block unsolicited audio.
  const greetingKey = "sageHarvestPujaGreeted";
  if (!sessionStorage.getItem(greetingKey)) {
    setTimeout(() => {
      if (!panel.classList.contains("open")) {
        const label = launcher.querySelector(".puja-launcher-label");
        if (label) {
          const original = label.textContent;
          label.textContent = "Hello, I’m Puja — ask me anything";
          launcher.classList.add("puja-attention");
          setTimeout(() => { label.textContent = original; launcher.classList.remove("puja-attention"); }, 6500);
        }
      }
      sessionStorage.setItem(greetingKey, "1");
    }, CONFIG.autoGreetingDelay);
  }

  document.addEventListener("keydown", event => { if (event.key === "Escape") { closePuja(); stopSpeaking(); } });
})();