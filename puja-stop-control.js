(() => {
  "use strict";

  const STOP_PHRASES = [
    "stop",
    "stop talking",
    "stop speaking",
    "stop voice",
    "be quiet",
    "quiet please",
    "please stop",
    "that's enough",
    "thats enough"
  ];

  const normalize = value => String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const isStopCommand = value => {
    const text = normalize(value);
    return STOP_PHRASES.some(phrase => text === phrase || text.startsWith(`${phrase} `));
  };

  const stopVoice = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    }

    const avatar = document.getElementById("pujaAvatar");
    const miniAvatar = document.getElementById("pujaMiniAvatar");
    const status = document.getElementById("pujaStatus");
    avatar?.classList.remove("speaking");
    miniAvatar?.classList.remove("speaking");
    if (status) status.textContent = "Sage Harvest Guide";
  };

  // Typed "stop talking" is handled before Puja's normal submit handler.
  const form = document.getElementById("pujaForm");
  form?.addEventListener("submit", event => {
    const input = document.getElementById("pujaInput");
    if (input && isStopCommand(input.value)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      stopVoice();
      input.value = "";
    }
  }, true);

  // Spoken commands are added to the chat by puja-bot.js. Watch for the
  // transcript and immediately cancel speech when it is a stop command.
  const messages = document.getElementById("pujaMessages");
  if (messages) {
    const observer = new MutationObserver(() => {
      const userMessages = messages.querySelectorAll(".puja-message-user .puja-message-content");
      const lastUser = userMessages[userMessages.length - 1];
      if (!lastUser || !isStopCommand(lastUser.textContent)) return;

      stopVoice();

      // Remove Puja's automatic reply to a stop command, so the interaction
      // ends cleanly instead of producing another artificial response.
      const allMessages = messages.querySelectorAll(".puja-message");
      const lastMessage = allMessages[allMessages.length - 1];
      if (lastMessage?.classList.contains("puja-message-bot")) {
        lastMessage.remove();
      }
    });
    observer.observe(messages, { childList: true, subtree: true });
  }

  document.getElementById("pujaStopSpeaking")?.addEventListener("click", stopVoice, true);
})();
