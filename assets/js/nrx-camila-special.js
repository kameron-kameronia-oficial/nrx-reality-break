(() => {
  "use strict";

  if (window.__NRX_CAMILA_SPECIAL__) return;
  window.__NRX_CAMILA_SPECIAL__ = true;

  const section = document.querySelector("[data-camila-special]");
  const audio = document.getElementById("camila-dangeragua-audio");
  const toggle = document.querySelector("[data-camila-audio-toggle]");
  const image = document.querySelector("[data-camila-banner-image]");

  if (!section || !audio || !toggle || !image) return;

  let userPaused = false;

  const updateButton = () => {
    const playing = !audio.paused && !audio.ended;
    toggle.setAttribute("aria-pressed", playing ? "true" : "false");
    toggle.setAttribute("aria-label", playing ? "Pausar Dangeragua" : "Reproducir Dangeragua");
    toggle.textContent = playing ? "❚❚" : "▶";
  };

  const safePlay = () => {
    audio.play().then(() => {
      updateButton();
    }).catch(() => {
      updateButton();
    });
  };

  const keepAlive = () => {
    if (userPaused) return;
    if (audio.paused || audio.ended) {
      safePlay();
    }
  };

  const onScroll = () => {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight || 1;
    const progress = Math.max(0, Math.min(1, (vh - rect.top) / (rect.height + vh * 0.25)));

    // Mas transparente al bajar.
    const opacity = 1 - progress * 0.58;
    const translateY = progress * 55;
    const scale = 1.05 - progress * 0.06;

    section.style.setProperty("--camila-banner-opacity", opacity.toFixed(3));
    section.style.setProperty("--camila-banner-translate", translateY.toFixed(2) + "px");
    section.style.setProperty("--camila-banner-scale", scale.toFixed(3));
  };

  toggle.addEventListener("click", () => {
    if (audio.paused || audio.ended) {
      userPaused = false;
      safePlay();
    } else {
      userPaused = true;
      audio.pause();
      updateButton();
    }
  });

  audio.addEventListener("play", updateButton);
  audio.addEventListener("pause", updateButton);
  audio.addEventListener("ended", () => {
    if (!userPaused) safePlay();
    updateButton();
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) keepAlive();
  });

  window.addEventListener("focus", keepAlive);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // Si el navegador bloquea autoplay, reintentar en la primera interaccion.
  const unlock = () => {
    keepAlive();
    document.removeEventListener("pointerdown", unlock);
    document.removeEventListener("keydown", unlock);
    document.removeEventListener("touchstart", unlock);
  };

  document.addEventListener("pointerdown", unlock, { passive: true });
  document.addEventListener("keydown", unlock);
  document.addEventListener("touchstart", unlock, { passive: true });

  onScroll();
  safePlay();
})();