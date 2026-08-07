(function () {
  "use strict";

  if (window.__KAMER_EXCLUSIVE_DEMO__) return;
  window.__KAMER_EXCLUSIVE_DEMO__ = true;

  const root = document.querySelector("[data-kamer-demo]");
  const page = document.querySelector(".kamer-season-page");
  if (!root || !page) return;

  const audio = document.getElementById("kamer-exclusive-audio");
  const banner = root.querySelector("[data-kamer-banner]");
  const toggle = root.querySelector("[data-kamer-toggle]");
  const reset = root.querySelector("[data-kamer-reset]");
  const progress = root.querySelector("[data-kamer-progress]");
  const status = root.querySelector("[data-kamer-status]");
  const time = root.querySelector("[data-kamer-time]");
  if (!audio || !toggle || !reset || !progress || !status || !time) return;

  const controller = new AbortController();
  const signal = controller.signal;
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const phaseClasses = ["kamer-phase-live", "kamer-phase-roots", "kamer-phase-wind", "kamer-phase-stable"];

  let rafId = 0;
  let seeking = false;
  let lastPhase = "";

  function formatClock(value) {
    if (!Number.isFinite(value)) return "00:00";
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function setStatus(text) {
    status.textContent = text;
  }

  function getPhase(currentTime) {
    if (currentTime >= 64) return "stable";
    if (currentTime >= 42.69) return "wind";
    if (currentTime >= 21.36) return "roots";
    return "live";
  }

  function applyPhase(phase) {
    if (phase === lastPhase) return;
    phaseClasses.forEach((className) => page.classList.remove(className));
    page.classList.add("kamer-phase-" + phase);
    root.dataset.kamerPhase = phase;
    lastPhase = phase;

    if (phase === "stable") setStatus("Estabilizacion activa. La musica sigue hasta el final.");
    else if (phase === "wind") setStatus("0:42.69 - viento sincronizado.");
    else if (phase === "roots") setStatus("0:21.36 - raices y senales externas.");
    else setStatus(audio.paused ? "Listo para iniciar la demo." : "0:00 - calma viva.");
  }

  function updateUi() {
    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
    const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const ratio = duration ? Math.min(1, current / duration) : 0;

    if (!seeking) progress.value = String(Math.round(ratio * 1000));
    progress.style.setProperty("--kamer-progress", String(ratio));
    time.textContent = formatClock(current) + " / " + formatClock(duration);
    time.setAttribute("datetime", "PT" + Math.round(current) + "S");
    applyPhase(getPhase(current));
  }

  function timelineLoop() {
    rafId = 0;
    updateUi();
    if (!audio.paused && !audio.ended && document.visibilityState === "visible") {
      rafId = requestAnimationFrame(timelineLoop);
    }
  }

  function startTimeline() {
    if (!rafId) rafId = requestAnimationFrame(timelineLoop);
  }

  function stopTimeline() {
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function pauseOtherMedia() {
    document.querySelectorAll("audio, video").forEach((media) => {
      if (media !== audio && !media.paused) media.pause();
    });
  }

  function setPlayingUi(playing) {
    toggle.textContent = playing ? "II" : "PLAY";
    toggle.setAttribute("aria-pressed", String(playing));
    toggle.setAttribute("aria-label", playing ? "Pausar demo exclusiva de Kamer" : "Reproducir demo exclusiva de Kamer");
  }

  async function playDemo() {
    pauseOtherMedia();
    try {
      await audio.play();
      setPlayingUi(true);
      startTimeline();
      updateUi();
    } catch (error) {
      setPlayingUi(false);
      setStatus("Pulsa PLAY para comenzar la demo.");
    }
  }

  function pauseDemo() {
    audio.pause();
    setPlayingUi(false);
    setStatus("Demo en pausa.");
    stopTimeline();
    updateUi();
  }

  async function resetDemo() {
    stopTimeline();
    audio.pause();
    audio.currentTime = 0;
    lastPhase = "";
    applyPhase("live");
    updateUi();
    await playDemo();
  }

  toggle.addEventListener("click", () => {
    if (audio.paused) playDemo();
    else pauseDemo();
  }, { signal });

  reset.addEventListener("click", () => {
    resetDemo();
  }, { signal });

  progress.addEventListener("input", () => {
    seeking = true;
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    if (duration) audio.currentTime = (Number(progress.value) / 1000) * duration;
    updateUi();
  }, { signal });

  progress.addEventListener("change", () => {
    seeking = false;
    updateUi();
    if (!audio.paused) startTimeline();
  }, { signal });

  audio.addEventListener("loadedmetadata", updateUi, { signal });
  audio.addEventListener("durationchange", updateUi, { signal });
  audio.addEventListener("timeupdate", updateUi, { signal });
  audio.addEventListener("play", () => {
    pauseOtherMedia();
    setPlayingUi(true);
    startTimeline();
  }, { signal });
  audio.addEventListener("pause", () => {
    setPlayingUi(false);
    stopTimeline();
    updateUi();
  }, { signal });
  audio.addEventListener("ended", () => {
    setPlayingUi(false);
    stopTimeline();
    audio.currentTime = 0;
    lastPhase = "";
    applyPhase("live");
    updateUi();
    setStatus("Demo finalizada. Pulsa PLAY para reiniciar.");
  }, { signal });
  audio.addEventListener("seeking", updateUi, { signal });
  audio.addEventListener("seeked", updateUi, { signal });

  if (banner) {
    banner.addEventListener("contextmenu", (event) => event.preventDefault(), { signal });
    banner.addEventListener("dragstart", (event) => event.preventDefault(), { signal });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !audio.paused) startTimeline();
    else stopTimeline();
  }, { signal });

  window.addEventListener("pagehide", () => {
    stopTimeline();
    controller.abort();
  }, { signal });

  if (reduceMotionQuery.matches) {
    root.dataset.reducedMotion = "true";
  }
  reduceMotionQuery.addEventListener("change", (event) => {
    root.dataset.reducedMotion = event.matches ? "true" : "false";
  }, { signal });

  applyPhase("live");
  updateUi();
  window.addEventListener("load", playDemo, { once: true, signal });

  window.__kamerExclusiveDebug = {
    phases: {
      live: [0, 21.35],
      roots: [21.36, 42.68],
      wind: [42.69, 63.99],
      stable: [64, "end"]
    },
    getPhase,
    getCurrentPhase: () => lastPhase,
    isRafActive: () => Boolean(rafId),
    getAudioCount: () => document.querySelectorAll("audio").length,
    getBannerCount: () => document.querySelectorAll(".kamer-banner-image").length,
    isReducedMotion: () => reduceMotionQuery.matches
  };
})();
