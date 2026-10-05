(() => {
  "use strict";

  // Puja's neural voice runs locally in the visitor's browser.
  // The Piper web package is loaded only when Puja first speaks.
  const PACKAGE_URL = "https://esm.sh/@mintplex-labs/piper-tts-web@1.0.5";
  const VOICE_ID = "en_US-hfc_female-medium";

  const nativeSynthesis = window.speechSynthesis;
  if (!nativeSynthesis) return;

  const nativeSpeak = nativeSynthesis.speak.bind(nativeSynthesis);
  const nativeCancel = nativeSynthesis.cancel.bind(nativeSynthesis);
  const nativeResume = nativeSynthesis.resume.bind(nativeSynthesis);

  let modulePromise = null;
  let audio = null;
  let objectUrl = null;
  let generation = 0;

  function setStatus(text) {
    const status = document.getElementById("pujaStatus");
    if (status && text) status.textContent = text;
  }

  function stopAudio() {
    generation += 1;
    if (audio) {
      try { audio.pause(); } catch (_) {}
      try { audio.currentTime = 0; } catch (_) {}
      audio.src = "";
      audio = null;
    }
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  }

  async function loadPiper() {
    if (!modulePromise) {
      modulePromise = import(PACKAGE_URL).catch(error => {
        modulePromise = null;
        throw error;
      });
    }
    return modulePromise;
  }

  async function neuralSpeak(utterance) {
    const text = String(utterance?.text || "").trim();
    if (!text) return;

    stopAudio();
    const activeGeneration = generation;

    try {
      setStatus("Puja is preparing her voice…");
      const tts = await loadPiper();
      if (activeGeneration !== generation) return;

      const wav = await tts.predict({ text, voiceId: VOICE_ID });
      if (activeGeneration !== generation) return;

      objectUrl = URL.createObjectURL(wav);
      audio = new Audio(objectUrl);
      audio.preload = "auto";

      audio.onended = () => {
        if (activeGeneration !== generation) return;
        try { utterance.onend?.({ type: "end", utterance }); } catch (_) {}
        stopAudio();
      };

      audio.onerror = () => {
        if (activeGeneration !== generation) return;
        try { utterance.onerror?.({ type: "error", utterance }); } catch (_) {}
        stopAudio();
      };

      try { utterance.onstart?.({ type: "start", utterance }); } catch (_) {}
      setStatus("Puja is speaking");
      await audio.play();
    } catch (error) {
      console.warn("Puja neural voice unavailable; using browser voice fallback.", error);
      if (activeGeneration !== generation) return;
      stopAudio();
      try { nativeSpeak(utterance); } catch (_) {}
    }
  }

  try {
    nativeSynthesis.speak = utterance => neuralSpeak(utterance);
    nativeSynthesis.cancel = () => {
      stopAudio();
      nativeCancel();
    };
    nativeSynthesis.resume = () => nativeResume();
  } catch (error) {
    console.warn("Puja could not install neural voice wrapper; browser TTS remains active.", error);
  }

  window.PujaNeuralVoice = {
    voiceId: VOICE_ID,
    load: loadPiper,
    stop: stopAudio,
    isReady: () => Boolean(modulePromise)
  };
})();