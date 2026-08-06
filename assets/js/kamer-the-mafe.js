(() => {
  "use strict";

  const audios = [...document.querySelectorAll(".case-audio")];
  const monitorTrack = document.getElementById("monitorTrack");
  const monitorTime = document.getElementById("monitorTime");
  const monitorProgress = document.getElementById("monitorProgress");
  let activeAudio = null;
  let raf = 0;

  const formatTime = value => {
    if (!Number.isFinite(value)) return "00:00";
    const total = Math.max(0, Math.floor(value));
    const minutes = String(Math.floor(total / 60)).padStart(2, "0");
    const seconds = String(total % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const resetCards = () => {
    document.querySelectorAll(".song-file.is-playing").forEach(card => {
      card.classList.remove("is-playing");
    });
  };

  const updateMonitor = () => {
    if (!activeAudio) return;

    const duration = Number.isFinite(activeAudio.duration) ? activeAudio.duration : 0;
    const current = Number.isFinite(activeAudio.currentTime) ? activeAudio.currentTime : 0;
    monitorTrack.textContent = activeAudio.dataset.track || "ARCHIVO ACTIVO";
    monitorTime.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    monitorProgress.style.width = duration > 0 ? `${Math.min(100, current / duration * 100)}%` : "0%";

    if (!activeAudio.paused && !activeAudio.ended) {
      raf = requestAnimationFrame(updateMonitor);
    }
  };

  const clearMonitor = () => {
    cancelAnimationFrame(raf);
    activeAudio = null;
    monitorTrack.textContent = "NINGÚN ARCHIVO ACTIVO";
    monitorTime.textContent = "00:00 / 00:00";
    monitorProgress.style.width = "0%";
    document.body.classList.remove("case-active");
    resetCards();
  };

  audios.forEach(audio => {
    audio.addEventListener("play", () => {
      audios.forEach(other => {
        if (other !== audio && !other.paused) other.pause();
      });

      activeAudio = audio;
      resetCards();
      audio.closest(".song-file")?.classList.add("is-playing");
      document.body.classList.add("case-active");
      cancelAnimationFrame(raf);
      updateMonitor();
    });

    audio.addEventListener("pause", () => {
      if (audio !== activeAudio || audio.ended) return;
      cancelAnimationFrame(raf);
      updateMonitor();
      document.body.classList.remove("case-active");
      audio.closest(".song-file")?.classList.remove("is-playing");
    });

    audio.addEventListener("ended", clearMonitor);
    audio.addEventListener("loadedmetadata", () => {
      if (audio === activeAudio) updateMonitor();
    });
    audio.addEventListener("seeked", () => {
      if (audio === activeAudio) updateMonitor();
    });
  });

  /* NRX: la música continúa al ocultar o desenfocar la pestaña. */
})();
