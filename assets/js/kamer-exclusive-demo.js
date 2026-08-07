(function () {
  "use strict";

  if (window.__KAMER_EXCLUSIVE_DEMO_V2__) return;
  window.__KAMER_EXCLUSIVE_DEMO_V2__ = true;

  const root = document.querySelector("[data-kamer-demo]");
  const page = document.querySelector(".kamer-season-page");
  if (!root || !page) return;

  const audio = document.getElementById("kamer-exclusive-audio");
  const toggle = root.querySelector("[data-kamer-toggle]");
  const reset = root.querySelector("[data-kamer-reset]");
  const progress = root.querySelector("[data-kamer-progress]");
  const status = root.querySelector("[data-kamer-status]");
  const time = root.querySelector("[data-kamer-time]");
  const banner = root.querySelector("[data-kamer-banner]");

  if (!audio || !toggle || !reset || !progress || !status || !time) return;

  audio.loop = true;
  audio.preload = "auto";

  const phaseClasses = [
    "kamer-phase-live",
    "kamer-phase-roots",
    "kamer-phase-wind",
    "kamer-phase-stable"
  ];

  let rafId = 0;
  let dragging = false;
  let pendingSeekRatio = null;
  let lastPhase = "";

  const fmt = (value) => {
    if (!Number.isFinite(value) || value < 0) return "00:00";
    const m = Math.floor(value / 60);
    const s = Math.floor(value % 60);
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  };

  const duration = () =>
    Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;

  const phaseAt = (t) => {
    if (t >= 64) return "stable";
    if (t >= 42.69) return "wind";
    if (t >= 21.36) return "roots";
    return "live";
  };

  const applyPhase = (phase) => {
    if (phase === lastPhase) return;
    phaseClasses.forEach((cls) => page.classList.remove(cls));
    page.classList.add("kamer-phase-" + phase);
    root.dataset.kamerPhase = phase;
    lastPhase = phase;

    if (phase === "stable") status.textContent = "Estabilización activa.";
    else if (phase === "wind") status.textContent = "0:42.69 — viento sincronizado.";
    else if (phase === "roots") status.textContent = "0:21.36 — raíces y señales externas.";
    else status.textContent = audio.paused ? "Lista. Pulsa ▶ para iniciar." : "0:00 — calma viva.";
  };

  const previewAt = (target) => {
    const d = duration();
    const safe = d ? Math.max(0, Math.min(d, target)) : Math.max(0, target);
    time.textContent = fmt(safe) + " / " + fmt(d);
    applyPhase(phaseAt(safe));
  };

  const sync = () => {
    const d = duration();
    const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const ratio = d ? Math.max(0, Math.min(1, current / d)) : 0;

    if (!dragging) {
      progress.value = String(Math.round(ratio * 1000));
      progress.style.setProperty("--kamer-progress", String(ratio));
    }

    time.textContent = fmt(current) + " / " + fmt(d);
    applyPhase(phaseAt(current));
  };

  const stopLoop = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  };

  const loop = () => {
    rafId = 0;
    sync();
    if (!audio.paused && !audio.ended && document.visibilityState === "visible") {
      rafId = requestAnimationFrame(loop);
    }
  };

  const startLoop = () => {
    if (!rafId && document.visibilityState === "visible") {
      rafId = requestAnimationFrame(loop);
    }
  };

  const pauseOtherMedia = () => {
    document.querySelectorAll("audio, video").forEach((media) => {
      if (media !== audio && !media.paused) media.pause();
    });
  };

  const setPlayingUi = (playing) => {
    toggle.textContent = playing ? "Ⅱ" : "▶";
    toggle.setAttribute("aria-pressed", String(playing));
    toggle.setAttribute(
      "aria-label",
      playing ? "Pausar demo exclusiva de Kamer" : "Reproducir demo exclusiva de Kamer"
    );
  };

  const seekRatio = (ratio, commit) => {
    const normalized = Math.max(0, Math.min(1, ratio));
    const d = duration();

    progress.style.setProperty("--kamer-progress", String(normalized));

    if (!d) {
      pendingSeekRatio = normalized;
      previewAt(0);
      return;
    }

    const target = normalized * d;
    previewAt(target);

    try {
      if (commit && typeof audio.fastSeek === "function") audio.fastSeek(target);
      else audio.currentTime = target;
      pendingSeekRatio = null;
    } catch (_) {
      pendingSeekRatio = normalized;
    }
  };

  const play = async () => {
    pauseOtherMedia();
    try {
      await audio.play();
      setPlayingUi(true);
      sync();
      startLoop();
    } catch (_) {
      setPlayingUi(false);
      status.textContent = "El navegador bloqueó el inicio automático. Pulsa ▶.";
    }
  };

  const pause = () => {
    audio.pause();
    setPlayingUi(false);
    stopLoop();
    sync();
    status.textContent = "Demo en pausa.";
  };

  toggle.addEventListener("click", () => {
    if (audio.paused) play();
    else pause();
  });

  reset.addEventListener("click", async () => {
    stopLoop();
    audio.pause();
    try { audio.currentTime = 0; } catch (_) {}
    lastPhase = "";
    progress.value = "0";
    progress.style.setProperty("--kamer-progress", "0");
    applyPhase("live");
    sync();
    await play();
  });

  progress.addEventListener("pointerdown", () => {
    dragging = true;
  });

  progress.addEventListener("input", () => {
    dragging = true;
    const ratio = Number(progress.value) / 1000;
    seekRatio(ratio, false);
  });

  const finishSeek = () => {
    const ratio = Number(progress.value) / 1000;
    seekRatio(ratio, true);
    dragging = false;
    sync();
    if (!audio.paused) startLoop();
  };

  progress.addEventListener("change", finishSeek);
  progress.addEventListener("pointerup", finishSeek);
  progress.addEventListener("keyup", (event) => {
    if (["ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"].includes(event.key)) {
      finishSeek();
    }
  });

  const metadataReady = () => {
    if (pendingSeekRatio !== null) seekRatio(pendingSeekRatio, true);
    sync();
  };

  ["loadedmetadata", "durationchange", "loadeddata", "canplay"].forEach((name) => {
    audio.addEventListener(name, metadataReady);
  });

  audio.addEventListener("timeupdate", sync);
  audio.addEventListener("seeking", sync);
  audio.addEventListener("seeked", () => {
    sync();
    if (!audio.paused) startLoop();
  });

  audio.addEventListener("play", () => {
    pauseOtherMedia();
    setPlayingUi(true);
    sync();
    startLoop();
  });

  audio.addEventListener("pause", () => {
    setPlayingUi(false);
    stopLoop();
    sync();
  });

  audio.addEventListener("error", () => {
    status.textContent = "No se pudo cargar el audio. Recarga la página.";
    setPlayingUi(false);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      sync();
      if (!audio.paused) startLoop();
    } else {
      stopLoop();
    }
  });

  window.addEventListener("focus", sync);
  window.addEventListener("pageshow", sync);

  if (banner) {
    banner.addEventListener("dragstart", (e) => e.preventDefault());
  }

  applyPhase("live");
  sync();

  // Intento opcional. Si Edge/Chrome lo bloquea, el botón queda listo.
  window.addEventListener("load", () => {
    play();
  }, { once: true });

  window.__kamerExclusiveDebug = {
    phaseAt,
    sync,
    seekTo: (seconds) => {
      const d = duration();
      if (!d) return false;
      seekRatio(seconds / d, true);
      return true;
    },
    duration,
    current: () => audio.currentTime
  };
})();