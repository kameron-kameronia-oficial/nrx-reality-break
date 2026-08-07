(() => {
  "use strict";

  if (window.__NRX_CAMILA_SPECIAL_V2__) return;
  window.__NRX_CAMILA_SPECIAL_V2__ = true;

  const section = document.querySelector("[data-camila-special]");
  const audio = document.getElementById("camila-dangeragua-audio");
  const toggle = document.querySelector("[data-camila-audio-toggle]");
  const image = document.querySelector("[data-camila-banner-image]");

  if (!section || !audio || !toggle || !image) return;

  let userPaused = false;
  let autoplayBlocked = false;
  let playAttempt = null;

  audio.autoplay = true;
  audio.loop = true;
  audio.preload = "auto";
  audio.muted = false;
  audio.volume = 1;
  audio.setAttribute("autoplay", "");
  audio.setAttribute("loop", "");
  audio.setAttribute("preload", "auto");
  audio.setAttribute("playsinline", "");

  const updateButton = () => {
    const playing = !audio.paused && !audio.ended;
    toggle.setAttribute("aria-pressed", playing ? "true" : "false");
    toggle.setAttribute("aria-label", playing ? "Pausar Dangeragua" : "Reproducir Dangeragua");
    toggle.textContent = playing ? "❚❚" : "▶";
    toggle.dataset.autoplayBlocked = autoplayBlocked ? "true" : "false";
    toggle.title = autoplayBlocked && !playing
      ? "El navegador bloqueó el audio automático. Haz clic o toca cualquier parte de la página para activarlo."
      : (playing ? "Pausar Dangeragua" : "Reproducir Dangeragua");
  };

  const tryPlay = () => {
    if (userPaused) return Promise.resolve(false);
    if (!audio.paused && !audio.ended) {
      autoplayBlocked = false;
      updateButton();
      return Promise.resolve(true);
    }
    if (playAttempt) return playAttempt;

    audio.muted = false;
    audio.volume = 1;

    playAttempt = audio.play()
      .then(() => {
        autoplayBlocked = false;
        updateButton();
        return true;
      })
      .catch(() => {
        autoplayBlocked = true;
        updateButton();
        return false;
      })
      .finally(() => {
        playAttempt = null;
      });

    return playAttempt;
  };

  const keepAlive = () => {
    if (!userPaused) void tryPlay();
  };

  const onScroll = () => {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight || 1;
    const progress = Math.max(0, Math.min(1, (vh - rect.top) / (rect.height + vh * 0.25)));
    const opacity = 1 - progress * 0.58;
    const translateY = progress * 55;
    const scale = 1.05 - progress * 0.06;
    section.style.setProperty("--camila-banner-opacity", opacity.toFixed(3));
    section.style.setProperty("--camila-banner-translate", `${translateY.toFixed(2)}px`);
    section.style.setProperty("--camila-banner-scale", scale.toFixed(3));
  };

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    if (audio.paused || audio.ended) {
      userPaused = false;
      autoplayBlocked = false;
      void tryPlay();
    } else {
      userPaused = true;
      audio.pause();
      updateButton();
    }
  });

  audio.addEventListener("play", () => {
    autoplayBlocked = false;
    updateButton();
  });
  audio.addEventListener("playing", () => {
    autoplayBlocked = false;
    updateButton();
  });
  audio.addEventListener("pause", updateButton);
  audio.addEventListener("ended", () => {
    if (!userPaused) {
      audio.currentTime = 0;
      void tryPlay();
    }
    updateButton();
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio > 0.08) keepAlive();
      }
    }, { threshold: [0.08, 0.2, 0.5] });
    observer.observe(section);
  }

  // IMPORTANTE: si el navegador niega autoplay con sonido, cualquier primer gesto
  // real del usuario en Camila vuelve a intentar el audio de inmediato.
  const unlockFromGesture = () => {
    if (!userPaused) {
      autoplayBlocked = false;
      void tryPlay();
    }
  };

  document.addEventListener("pointerdown", unlockFromGesture, { capture: true, passive: true });
  document.addEventListener("touchstart", unlockFromGesture, { capture: true, passive: true });
  document.addEventListener("keydown", unlockFromGesture, true);
  document.addEventListener("click", unlockFromGesture, true);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) keepAlive();
  });
  window.addEventListener("focus", keepAlive, true);
  window.addEventListener("pageshow", keepAlive, true);
  window.addEventListener("load", keepAlive, true);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  onScroll();
  updateButton();

  // Intentar en varios momentos de la carga.
  void tryPlay();
  requestAnimationFrame(() => void tryPlay());
  setTimeout(() => void tryPlay(), 120);
  setTimeout(() => void tryPlay(), 450);
  setTimeout(() => void tryPlay(), 1000);
  setTimeout(() => void tryPlay(), 1800);
})();
