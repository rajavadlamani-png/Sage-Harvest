(() => {
  "use strict";

  const CONFIG = {
    name: "Puja",
    language: "en-IN",
    speechRate: 0.94,
    speechPitch: 1.04,
    autoSpeak: true,
    autoGreetingDelay: 3500,
    minIntentScore: 2
  };

  // Editable Sage Harvest knowledge. Each topic has natural-language examples,
  // a concise answer, and optional follow-up detail.
  const KNOWLEDGE = [
    {
      id: "welcome",
      phrases: ["hello", "hi", "hey", "help", "who are you", "what can you do", "introduce yourself", "what is your name"],
      words: ["hello", "hi", "hey", "help", "puja", "assistant", "agent"],
      answer: "Hello, I’m Puja, the virtual agent for Sage Harvest. I can explain what we do, answer questions about the website, and guide you to the relevant section. What would you like to know?"
    },
    {
      id: "sage-harvest",
      phrases: ["what is sage harvest", "tell me about sage harvest", "what does sage harvest do", "what do you do", "what is this website", "tell me about this website", "what is sage harvest agro"],
      words: ["sage", "harvest", "website", "company", "business", "firm", "advisory"],
      answer: "Sage Harvest Agro is an independent, practitioner-led advisory firm focused on seed and agri-business supply chains. In simple terms, we help organizations understand their operations, identify constraints and design better, more resilient systems. The site covers supply-chain transformation, Digital & AI, sustainability, due diligence and international expansion."
    },
    {
      id: "services",
      phrases: ["what services do you provide", "what services do you offer", "what can sage harvest help with", "what are your services", "tell me about your services", "how can you help a company"],
      words: ["services", "service", "consulting", "advisory", "offer", "help"],
      answer: "There are several areas. Sage Harvest works on supply-chain transformation; Digital & AI; sustainability and climate; supply-chain due diligence and operational risk; and international expansion and cross-border trade. If you tell me which area interests you, I can explain it in more detail."
    },
    {
      id: "supply-chain",
      phrases: ["tell me about supply chain transformation", "how do you improve supply chains", "what is seed supply chain", "how does sage harvest approach supply chains", "what does supply chain transformation mean"],
      words: ["supply", "chain", "seed", "production", "planning", "processing", "quality", "warehouse", "inventory", "distribution", "traceability", "operations"],
      answer: "Sage Harvest treats the seed supply chain as one connected system rather than a collection of separate functions. The perspective covers production planning, processing, quality, warehousing, inventory, distribution and traceability, with the aim of improving the operating model and the decisions made across the network."
    },
    {
      id: "digital-ai",
      phrases: ["tell me about digital and ai", "how do you use ai", "what is your ai work", "how can ai help seed supply chains", "tell me about machine learning", "what about satellite data", "what about forecasting"],
      words: ["digital", "ai", "artificial", "intelligence", "machine", "learning", "regression", "forecast", "forecasting", "analytics", "satellite", "weather", "data", "traceability"],
      answer: "Sage Harvest looks at Digital & AI as a decision-support capability, not technology for its own sake. The work described on the site includes AI and analytics, forecasting, satellite and weather intelligence, traceability and data-driven decision support for modern agricultural supply chains."
    },
    {
      id: "sustainability",
      phrases: ["tell me about sustainability", "what do you mean by climate smart", "how do you address climate", "tell me about carbon", "what is mrv", "how can supply chains become sustainable"],
      words: ["sustainability", "climate", "carbon", "mrv", "resilience", "resource", "efficiency", "emissions"],
      answer: "Sage Harvest connects sustainability with the way the supply chain actually operates. The website covers climate-smart supply chains, resource efficiency, carbon and MRV-oriented approaches, and sustainability assurance."
    },
    {
      id: "ma",
      phrases: ["what is m and a due diligence", "tell me about m&a", "tell me about due diligence", "how do you assess an acquisition", "what is operational risk assessment", "can you help investors"],
      words: ["m", "a", "merger", "acquisition", "due", "diligence", "operational", "risk", "investor", "transaction"],
      answer: "Sage Harvest's due-diligence work is about understanding the operational reality behind the numbers. That can include production, infrastructure, inventory, quality, capacity and operating risks, helping management teams, investors and transaction teams make better-informed decisions."
    },
    {
      id: "international",
      phrases: ["tell me about international expansion", "how can you help with exports", "what about india africa", "do you help companies enter new markets", "tell me about global expansion", "can you help with cross border trade"],
      words: ["international", "global", "export", "cross", "border", "india", "africa", "trade", "market", "partner", "expansion"],
      answer: "Sage Harvest supports organizations exploring international markets, export opportunities, strategic partnerships and cross-border supply chains. The international focus connects market intelligence, commercial strategy, partner facilitation and disciplined execution."
    },
    {
      id: "founder",
      phrases: ["who is raja vadlamani", "tell me about raja", "who founded sage harvest", "who is the founder", "tell me about the founder"],
      words: ["raja", "vadlamani", "founder", "principal", "advisor", "experience", "corteva", "advanta", "shriram", "seedworks"],
      answer: "Raja Vadlamani is the Founder and Principal Advisor of Sage Harvest. The website describes nearly four decades across the seed and agri-business ecosystem, with experience across Corteva, Advanta, Shriram Bioseed and SeedWorks International."
    },
    {
      id: "insights",
      phrases: ["where are your articles", "show me your articles", "tell me about your insights", "what have you written", "where can i read your articles", "do you publish"],
      words: ["insights", "articles", "article", "writing", "publication", "linkedin", "read", "thought"],
      answer: "The Insights section is Sage Harvest's space for practical perspectives on seed supply chains, AI, sustainability and industry transformation. You can open Insights from the main navigation to explore the published material."
    },
    {
      id: "youtube",
      phrases: ["where is your youtube", "tell me about supply chain with raja", "where can i watch your videos", "do you have videos", "show me your youtube channel"],
      words: ["youtube", "video", "videos", "channel", "watch", "supply", "chain", "raja"],
      answer: "Yes. Supply Chain With Raja is the video knowledge platform associated with Sage Harvest. It covers practical conversations and explainers around seed supply chains, AI, sustainability and industry transformation."
    },
    {
      id: "labs",
      phrases: ["what are the labs", "tell me about labs", "what do you experiment with", "what tools have you built", "what is sage harvest labs"],
      words: ["labs", "lab", "experiment", "experiments", "tools", "innovation", "prototype"],
      answer: "Labs is the practical experimentation space of Sage Harvest. It is intended for tools, experiments and emerging ideas that can make supply-chain decisions more useful and practical."
    },
    {
      id: "case-perspectives",
      phrases: ["show me your case studies", "tell me about your case perspectives", "what experience do you have", "what projects have you worked on", "tell me about greenfield projects"],
      words: ["case", "cases", "perspective", "projects", "experience", "greenfield", "project"],
      answer: "Case Perspectives brings practical experience into the website, including supply-chain transformation, planning, technology, sustainability and operational challenges. It is intended to show how the ideas translate into real operating situations."
    },
    {
      id: "contact",
      phrases: ["how do i contact you", "how can i get in touch", "i want to contact sage harvest", "can we work together", "how can i engage you", "talk to someone"],
      words: ["contact", "email", "phone", "engage", "conversation", "talk", "work", "together"],
      answer: "Certainly. The Talk to Us and Contact sections are the best place to start a conversation with Sage Harvest. If you tell me what you are looking for, I can also point you to the most relevant part of the site."
    }
  ];

  const ROUTES = {
    services: "services.html",
    "digital-ai": "digital-ai.html",
    sustainability: "sustainability.html",
    ma: "ma-due-diligence.html",
    international: "international-expansion.html",
    founder: "founder.html",
    insights: "insights.html",
    youtube: "https://www.youtube.com/@rajavadlamani",
    labs: "labs.html",
    "case-perspectives": "case-studies.html",
    contact: "contact.html"
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

  if (!panel || !launcher || !form || !input || !messages) return;

  let lastTopic = null;
  let lastUserQuestion = "";

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
    const preferred = ["en-IN", "en-US", "en-GB"];
    for (const language of preferred) {
      const candidates = voices.filter(v => v.lang.toLowerCase().startsWith(language.toLowerCase()));
      if (candidates.length) {
        pujaVoice = candidates.find(v => /female|zira|samantha|susan|heera|google.*female|aria/i.test(v.name)) || candidates[0];
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

  function normalize(text) {
    return text.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9&\s-]/g, " ").replace(/\s+/g, " ").trim();
  }

  const STOP_WORDS = new Set(["a", "an", "the", "is", "are", "do", "does", "did", "can", "could", "would", "you", "your", "i", "me", "my", "we", "us", "to", "for", "of", "and", "or", "in", "on", "about", "tell", "please", "what", "how", "who", "where", "why", "with", "this", "that", "it", "from"]);

  function tokens(text) {
    return normalize(text).split(" ").filter(w => w && !STOP_WORDS.has(w));
  }

  function scoreEntry(query, entry) {
    const q = normalize(query);
    const qTokens = new Set(tokens(query));
    let score = 0;

    entry.phrases.forEach(phrase => {
      const p = normalize(phrase);
      if (q === p) score += 12;
      else if (q.includes(p)) score += 8;
    });

    entry.words.forEach(word => {
      const w = normalize(word);
      if (qTokens.has(w)) score += 2;
    });

    // Reward several related terms, but avoid one-word false matches.
    const matched = entry.words.filter(word => qTokens.has(normalize(word))).length;
    if (matched >= 3) score += 2;
    return score;
  }

  function findBest(query) {
    let best = null;
    let bestScore = 0;
    KNOWLEDGE.forEach(entry => {
      const score = scoreEntry(query, entry);
      if (score > bestScore) {
        best = entry;
        bestScore = score;
      }
    });
    return { entry: best, score: bestScore };
  }

  function isFollowUp(q) {
    const n = normalize(q);
    return /^(tell me more|more|go on|explain more|can you explain|why|how so|what do you mean|what about it|and what about that|give me an example|example|say more|continue|please explain)/.test(n) || n.length < 20 && /\b(more|why|how|example|explain)\b/.test(n);
  }

  function followUpFor(topic, query) {
    const q = normalize(query);
    const follow = isFollowUp(q);
    if (!follow) return null;

    const details = {
      "sage-harvest": "The underlying idea is practical: understand the complete operating system, diagnose the real constraint, and then design an improvement that can work in the field—not just on a presentation slide.",
      services: "The common thread across the services is independent, practitioner-led advice. The aim is to connect strategy with what actually happens in production, processing, data, infrastructure and execution.",
      "supply-chain": "For example, a change in production planning can affect processing capacity, inventory, quality, warehousing and ultimately market service. That is why Sage Harvest looks across the network rather than optimizing one function in isolation.",
      "digital-ai": "The important distinction is that AI is being treated as a decision-support tool. Better forecasts, satellite or weather signals and connected data are useful when they improve a real supply-chain decision.",
      sustainability: "The sustainability perspective is similarly operational. Climate resilience, resource efficiency and measurement need to connect with the way the seed supply chain is planned and managed.",
      ma: "In an acquisition or investment context, the question is not only whether the reported numbers look attractive. It is also whether the physical operation, capacity, inventory, quality systems and supply-chain risks support those numbers.",
      international: "The focus is not simply on exporting a product. Market entry also requires understanding the market, finding credible partners, aligning the commercial model and executing the cross-border supply chain.",
      founder: "His background spans seed-industry operations and transformation, which is reflected in the practitioner-led positioning of Sage Harvest.",
      insights: "The intention is to make the Insights section useful to practitioners—ideas that connect industry experience with changing technology, climate and supply-chain realities.",
      youtube: "The channel extends that same practitioner perspective into conversations and explainers, so visitors can explore ideas beyond the website pages.",
      labs: "The Labs concept is deliberately practical: build or test useful ideas, tools and approaches and learn from what works.",
      "case-perspectives": "The case material is meant to show the reasoning behind an intervention—what the operating problem was, how it was understood and what kind of system-level response was considered.",
      contact: "If you share the kind of challenge you are facing, Puja can first help you identify which Sage Harvest capability is likely to be relevant before you contact the team."
    };
    return details[topic] || null;
  }

  function addNavigation(id) {
    const href = ROUTES[id];
    if (!href) return;
    const link = document.createElement("a");
    link.href = href;
    link.textContent = id === "youtube" ? "Open Supply Chain With Raja →" : "Explore this Sage Harvest section →";
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
    const clean = query.trim();
    const best = findBest(clean);

    if (isFollowUp(clean) && lastTopic) {
      const detail = followUpFor(lastTopic, clean);
      if (detail) return { text: detail, id: lastTopic };
    }

    if (best.entry && best.score >= CONFIG.minIntentScore) {
      lastTopic = best.entry.id;
      return { text: best.entry.answer, id: best.entry.id };
    }

    // If the visitor asks a short continuation, stay with the current topic.
    if (lastTopic && clean.length < 24) {
      const detail = followUpFor(lastTopic, `tell me more ${clean}`);
      if (detail) return { text: detail, id: lastTopic };
    }

    return {
      text: "I’m not completely sure what you mean yet. I can help with Sage Harvest’s services, seed supply-chain transformation, Digital & AI, sustainability, M&A due diligence, international expansion, the founder, Insights, Labs or Supply Chain With Raja. Try asking me in your own words—for example, “How can you help a seed company improve its supply chain?”"
    };
  }

  function process(query) {
    const clean = query.trim();
    if (!clean) return;
    stopSpeaking();
    lastUserQuestion = clean;
    addMessage(clean, "user");
    const response = route(clean);
    addMessage(response.text, "bot");
    if (response.id && ROUTES[response.id] && !isFollowUp(clean)) addNavigation(response.id);
    speak(response.text);
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
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

    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      input.value = transcript;
      process(transcript);
      input.value = "";
    };

    recognition.onerror = event => {
      const message = event.error === "not-allowed"
        ? "I need microphone permission to hear you. Please allow it in your browser and try again."
        : event.error === "no-speech"
          ? "I didn't catch that. Please say it again, or type your question below."
          : "I had trouble hearing that. Please try again, or type your question.";
      addMessage(message);
    };

    recognition.onend = () => {
      listening = false;
      mic.classList.remove("active");
      setAvatarState("idle");
      if (status) status.textContent = "Sage Harvest Guide";
    };

    mic.addEventListener("click", () => {
      if (listening) {
        recognition.stop();
        return;
      }
      stopSpeaking();
      try {
        recognition.start();
      } catch (error) {
        console.warn("Puja speech recognition could not start", error);
      }
    });
  } else if (mic) {
    mic.disabled = true;
    mic.title = "Speech recognition is not supported in this browser.";
  }

  const greetingKey = "sageHarvestPujaGreeted";
  if (!sessionStorage.getItem(greetingKey)) {
    setTimeout(() => {
      if (!panel.classList.contains("open")) {
        const label = launcher.querySelector(".puja-launcher-label");
        if (label) {
          const original = label.textContent;
          label.textContent = "Hello, I’m Puja — ask me anything";
          launcher.classList.add("puja-attention");
          setTimeout(() => {
            label.textContent = original;
            launcher.classList.remove("puja-attention");
          }, 6500);
        }
      }
      sessionStorage.setItem(greetingKey, "1");
    }, CONFIG.autoGreetingDelay);
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closePuja();
      stopSpeaking();
    }
  });
})();