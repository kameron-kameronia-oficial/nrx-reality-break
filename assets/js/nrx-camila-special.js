(() => {
  "use strict";

  if (window.__NRX_CAMILA_SPECIAL__) return;
  window.__NRX_CAMILA_SPECIAL__ = true;

  const audio = document.getElementById("camila-dangeragua-audio");
  const toggle = document.querySelector("[data-camila-audio-toggle]");
  const image = document.querySelector("[data-camila-page-image]");
  const pageBg = document.querySelector("[data-camila-page-bg]");

  if (!audio || !toggle || !image || !pageBg) return;

  let userPaused = false;

  audio.autoplay = true;
  audio.loop = true;
  audio.muted = false;
  audio.volume = 1;
  audio.preload = "auto";

  const updateButton = () => {
    const playing = !audio.paused && !audio.ended;
    toggle.setAttribute("aria-pressed", playing ? "true" : "false");
    toggle.setAttribute("aria-label", playing ? "Pausar Dangeragua" : "Reproducir Dangeragua");
    toggle.textContent = playing ? "❚❚" : "▶";
  };

  const safePlay = () => {
    if (userPaused) return;
    audio.muted = false;
    audio.volume = 1;
    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(updateButton).catch(updateButton);
    } else {
      updateButton();
    }
  };

  const keepAlive = () => {
    if (userPaused) return;
    if (audio.paused || audio.ended) safePlay();
  };

  const onScroll = () => {
    const doc = document.documentElement;
    const total = Math.max(1, doc.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, window.scrollY / total));
    const opacity = 0.96 - progress * 0.48;
    const translateY = progress * 22;
    const scale = 1.08 - progress * 0.04;

    doc.style.setProperty("--camila-bg-opacity", opacity.toFixed(3));
    doc.style.setProperty("--camila-bg-translate", translateY.toFixed(2) + "px");
    doc.style.setProperty("--camila-bg-scale", scale.toFixed(3));
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
  window.addEventListener("pageshow", keepAlive);
  window.addEventListener("load", () => { onScroll(); safePlay(); });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  const unlock = () => {
    if (!userPaused) safePlay();
  };

  document.addEventListener("pointerdown", unlock, { passive: true });
  document.addEventListener("keydown", unlock);
  document.addEventListener("touchstart", unlock, { passive: true });

  onScroll();
  safePlay();
})();