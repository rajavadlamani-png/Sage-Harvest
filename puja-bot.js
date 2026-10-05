(() => {
  "use strict";

  const CONFIG = {
    name: "Puja",
    language: "en-IN",
    speechRate: 0.96,
    speechPitch: 1.05,
    autoSpeak: true,
    videoId: "pujaVideo"
  };

  const KNOWLEDGE = {
    faqs: [
      { keywords: ["sage harvest", "what is sage harvest", "about sage harvest", "what do you do"], answer: "Sage Harvest is an independent seed and agri-business advisory platform focused on supply-chain transformation, digital and AI, sustainability, due diligence and international expansion." },
      { keywords: ["founder", "raja", "raja vadlamani", "who is raja"], answer: "Sage Harvest was founded by Raja Vadlamani, a senior seed and supply-chain professional with experience across the seed and agri-business ecosystem." },
      { keywords: ["supply chain", "supply-chain", "seed supply chain", "transformation"], answer: "Sage Harvest works across the seed supply chain, including production planning, processing, quality, warehousing, inventory, logistics, traceability and operating-model improvement." },
      { keywords: ["ai", "artificial intelligence", "machine learning", "forecasting", "analytics", "satellite"], answer: "Sage Harvest explores practical applications of AI, machine learning, forecasting, satellite intelligence and decision-support systems for agricultural and seed supply chains." },
      { keywords: ["sustainability", "climate", "carbon", "mrv", "climate resilience"], answer: "Sage Harvest works on climate resilience, resource efficiency, sustainability assessment and carbon or MRV-oriented approaches, connecting sustainability with operating performance." },
      { keywords: ["m&a", "merger", "acquisition", "acquisitions", "due diligence", "operational risk"], answer: "Sage Harvest provides supply-chain due diligence for mergers, acquisitions and strategic investments, examining operating models, production, infrastructure, inventory, quality and operational risks." },
      { keywords: ["international", "global", "export", "cross border", "cross-border", "india africa", "africa", "trade"], answer: "Sage Harvest is developing an international expansion and cross-border trade advisory capability covering market exploration, partner facilitation, export readiness and commercial strategy." },
      { keywords: ["contact", "engage", "consulting", "advisor", "talk"], answer: "You can start a conversation with Sage Harvest through the Talk to Us section of the website." }
    ],
    videoChapters: [
      { id: "introduction", title: "Introduction", start: 0, keywords: ["introduction", "intro", "beginning", "start"], explanation: "This section introduces the Sage Harvest story and the context for the video." },
      { id: "seed-supply-chain", title: "Seed Supply Chain", start: 45, keywords: ["seed supply chain", "supply chain", "seed industry", "production"], explanation: "This section explains how production, processing, quality, inventory, logistics and market requirements connect across the seed supply chain." },
      { id: "ai", title: "AI and Data", start: 120, keywords: ["ai", "artificial intelligence", "machine learning", "data", "forecasting", "satellite"], explanation: "This section discusses how data, machine learning, forecasting and satellite intelligence can support better planning and decisions." },
      { id: "sustainability", title: "Sustainability and Climate", start: 190, keywords: ["sustainability", "climate", "carbon", "sustainable", "sustainable rice", "rice", "awd"], explanation: "This section connects climate-smart agriculture, resource efficiency, measurement and supply-chain resilience." },
      { id: "international", title: "Global Expansion", start: 260, keywords: ["international", "global", "export", "trade", "africa", "india africa"], explanation: "This section introduces market entry, strategic partnerships and cross-border seed and agri-business opportunities." },
      { id: "conclusion", title: "Conclusion", start: 330, keywords: ["conclusion", "ending", "end", "summary"], explanation: "This section summarizes the key ideas and Sage Harvest's role in helping organizations navigate change." }
    ]
  };

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
  const video = $(CONFIG.videoId);
  const currentChapter = $("pujaCurrentChapter");
  const chapterList = $("pujaChapterList");

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
    const langs = ["en-IN", "en-US", "en-GB"];
    for (const lang of langs) {
      const candidates = voices.filter(v => v.lang.toLowerCase().startsWith(lang.toLowerCase()));
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
    const u = new SpeechSynthesisUtterance(text);
    u.lang = CONFIG.language;
    u.rate = CONFIG.speechRate;
    u.pitch = CONFIG.speechPitch;
    if (pujaVoice) u.voice = pujaVoice;
    u.onstart = () => { setAvatarState("speaking"); if (status) status.textContent = "Puja is speaking"; };
    u.onend = () => { setAvatarState("idle"); if (status) status.textContent = "Sage Harvest Guide"; };
    u.onerror = () => { setAvatarState("idle"); if (status) status.textContent = "Sage Harvest Guide"; };
    synth.speak(u);
  }

  stop?.addEventListener("click", stopSpeaking);

  function normalize(text) {
    return text.toLowerCase().replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function playVideo() {
    if (!video) return false;
    const p = video.play();
    p?.catch(() => addMessage("The browser blocked automatic playback. Please press the play button on the video."));
    return true;
  }

  function seekChapter(chapter, play = true) {
    if (!video) {
      addMessage("The video player is not configured on this page yet. Add your video source and I will be able to navigate its chapters.");
      return false;
    }
    video.currentTime = chapter.start;
    if (currentChapter) currentChapter.textContent = `${chapter.title} — ${formatTime(chapter.start)}`;
    if (play) playVideo();
    return true;
  }

  function renderChapters() {
    if (!chapterList) return;
    chapterList.innerHTML = "";
    KNOWLEDGE.videoChapters.forEach(ch => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "puja-chapter-button";
      b.innerHTML = `<span>${ch.title}</span><span class="puja-chapter-time">${formatTime(ch.start)}</span>`;
      b.addEventListener("click", () => {
        seekChapter(ch, true);
        addMessage(`${ch.title}: ${ch.explanation}`);
        speak(ch.explanation);
      });
      chapterList.appendChild(b);
    });
  }
  renderChapters();

  video?.addEventListener("timeupdate", () => {
    let active = null;
    KNOWLEDGE.videoChapters.forEach(ch => { if (video.currentTime >= ch.start) active = ch; });
    if (active && currentChapter) currentChapter.textContent = `${active.title} — ${formatTime(active.start)}`;
  });

  function findChapter(query) {
    const q = normalize(query);
    let best = null, scoreBest = 0;
    KNOWLEDGE.videoChapters.forEach(ch => {
      let score = 0;
      ch.keywords.forEach(k => { const key = normalize(k); if (q.includes(key)) score += key.includes(" ") ? 4 : 2; });
      if (q.includes(normalize(ch.title))) score += 5;
      if (score > scoreBest) { scoreBest = score; best = ch; }
    });
    return best;
  }

  function findFaq(query) {
    const q = normalize(query);
    let best = null, scoreBest = 0;
    KNOWLEDGE.faqs.forEach(faq => {
      let score = 0;
      faq.keywords.forEach(k => { const key = normalize(k); if (q.includes(key)) score += key.includes(" ") ? 4 : 2; });
      if (score > scoreBest) { scoreBest = score; best = faq; }
    });
    return best;
  }

  function route(query) {
    const q = normalize(query);

    if (/^(pause|pause video|stop video)$/.test(q) || /\bpause\b.*\bvideo\b/.test(q)) {
      video?.pause();
      return { text: "The video is paused." };
    }
    if (/^(play|play video|start video|continue video)$/.test(q) || /\b(play|start|continue)\b.*\bvideo\b/.test(q)) {
      playVideo();
      return { text: "Playing the video." };
    }
    if (/\b(restart|start over|begin again)\b/.test(q)) {
      if (video) { video.currentTime = 0; playVideo(); }
      return { text: "I've restarted the video." };
    }

    const videoIntent = /\b(video|section|chapter|part|show me|take me|go to)\b/.test(q);
    if (videoIntent) {
      const ch = findChapter(q);
      if (ch) {
        seekChapter(ch, true);
        return { text: `${ch.title}: ${ch.explanation}` };
      }
    }

    const faq = findFaq(q);
    if (faq) return { text: faq.answer };

    return { text: "I can help you explore Sage Harvest, including supply-chain transformation, AI and analytics, sustainability, M&A due diligence, international expansion and the video topics on this page. Try asking me about one of those areas." };
  }

  function process(query) {
    const clean = query.trim();
    if (!clean) return;
    addMessage(clean, "user");
    const response = route(clean);
    addMessage(response.text, "bot");
    speak(response.text);
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    process(input.value);
    input.value = "";
  });

  document.querySelectorAll("[data-puja-question]").forEach(button => {
    button.addEventListener("click", () => {
      openPuja();
      process(button.dataset.pujaQuestion || "");
    });
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

    recognition.onstart = () => {
      listening = true;
      mic.classList.add("active");
      setAvatarState("listening");
      if (status) status.textContent = "Listening...";
    };
    recognition.onresult = e => {
      const transcript = e.results[0][0].transcript;
      process(transcript);
    };
    recognition.onerror = e => {
      const message = e.error === "not-allowed" ? "Microphone permission was not granted. Please allow microphone access in your browser." : e.error === "no-speech" ? "I didn't hear anything. Please try again." : "I couldn't understand the microphone input.";
      addMessage(message);
    };
    recognition.onend = () => {
      listening = false;
      mic.classList.remove("active");
      setAvatarState("idle");
      if (status) status.textContent = "Sage Harvest Guide";
    };
    mic.addEventListener("click", () => {
      if (listening) { recognition.stop(); return; }
      stopSpeaking();
      try { recognition.start(); } catch (err) { console.warn("Puja recognition start failed", err); }
    });
  } else if (mic) {
    mic.disabled = true;
    mic.title = "Speech recognition is not supported in this browser.";
  }

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closePuja(); stopSpeaking(); }
  });
})();