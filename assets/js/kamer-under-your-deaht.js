(() => {
  "use strict";

  const menuAudio = document.getElementById("menuWeek2Audio");
  const menuToggle = document.getElementById("menuToggle");
  const dockToggle = document.getElementById("dockToggle");
  const menuStatus = document.getElementById("menuStatus");
  const dockStatus = document.getElementById("dockStatus");
  const gate = document.getElementById("autoplayGate");
  const gateButton = document.getElementById("autoplayButton");
  const trackAudios = [...document.querySelectorAll(".track-audio")];
  const variantButtons = [...document.querySelectorAll(".variant-button")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let menuManuallyPaused = false;
  let interruptedByTrack = false;
  let hiddenWasPlaying = false;
  let fractureTimer = 0;

  function setMenuState() {
    const playing = !menuAudio.paused && !menuAudio.ended;
    document.body.classList.toggle("soundtrack-active", playing);
    menuToggle.setAttribute("aria-pressed", String(playing));
    menuToggle.textContent = playing ? "❚❚ Pausar menú de Week 2" : "▶ Activar menú de Week 2";
    dockToggle.textContent = playing ? "❚❚" : "▶";
    dockStatus.textContent = playing ? "SEÑAL ACTIVA" : interruptedByTrack ? "INTERRUMPIDA" : "EN ESPERA";
    menuStatus.textContent = playing
      ? "Menu Week 2 está reproduciéndose"
      : interruptedByTrack
        ? "El menú se pausó mientras escuchas otra canción"
        : "La señal del menú está detenida";
  }

  async function playMenu({ manual = false } = {}) {
    if (trackAudios.some(audio => !audio.paused && !audio.ended)) return;
    if (manual) menuManuallyPaused = false;
    interruptedByTrack = false;
    try {
      await menuAudio.play();
      gate.hidden = true;
    } catch {
      gate.hidden = false;
    }
    setMenuState();
  }

  function pauseMenu({ manual = false, track = false } = {}) {
    if (manual) menuManuallyPaused = true;
    if (track) interruptedByTrack = true;
    menuAudio.pause();
    setMenuState();
  }

  function toggleMenu() {
    if (menuAudio.paused) {
      playMenu({ manual: true });
    } else {
      pauseMenu({ manual: true });
    }
  }

  async function resumeMenuAfterTracks() {
    const foregroundActive = trackAudios.some(audio => !audio.paused && !audio.ended);
    if (!foregroundActive && interruptedByTrack && !menuManuallyPaused) {
      await playMenu();
    }
  }

  trackAudios.forEach(audio => {
    audio.addEventListener("play", () => {
      trackAudios.forEach(other => {
        if (other !== audio && !other.paused) other.pause();
      });
      pauseMenu({ track: true });
      document.body.classList.add("track-playing");
      dockStatus.textContent = audio.dataset.trackName || "CANCIÓN ACTIVA";
    });

    audio.addEventListener("pause", () => {
      window.setTimeout(() => {
        const active = trackAudios.some(item => !item.paused && !item.ended);
        document.body.classList.toggle("track-playing", active);
        resumeMenuAfterTracks();
      }, 120);
    });

    audio.addEventListener("ended", () => {
      document.body.classList.remove("track-playing");
      resumeMenuAfterTracks();
    });
  });

  variantButtons.forEach(button => {
    button.addEventListener("click", async () => {
      const audio = document.getElementById(button.dataset.audio);
      if (!audio) return;

      const wasPlaying = !audio.paused;
      const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
      const siblingButtons = variantButtons.filter(item => item.dataset.audio === button.dataset.audio);
      siblingButtons.forEach(item => item.classList.toggle("active", item === button));

      audio.pause();
      audio.src = button.dataset.source;
      audio.dataset.trackName = `${audio.id === "biggestAudio" ? "The Biggest Deaths" : "Invased"} — ${button.dataset.label}`;
      audio.load();

      audio.addEventListener("loadedmetadata", function restorePosition() {
        audio.removeEventListener("loadedmetadata", restorePosition);
        audio.currentTime = Math.min(currentTime, Math.max(0, audio.duration - 0.2));
        if (wasPlaying) audio.play().catch(() => {});
      });
    });
  });

  function prepareCrumble() {
    if (reduceMotion) return;
    document.querySelectorAll("[data-crumble]").forEach(element => {
      const nodes = [...element.childNodes];
      nodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          const fragment = document.createDocumentFragment();
          [...node.textContent].forEach(character => {
            if (character === " ") {
              fragment.append(" ");
            } else {
              const span = document.createElement("span");
              span.className = "crumble-char";
              span.textContent = character;
              fragment.append(span);
            }
          });
          node.replaceWith(fragment);
        }
      });
    });
  }

  function scheduleFracture() {
    if (reduceMotion) return;
    window.clearTimeout(fractureTimer);
    const delay = 4200 + Math.random() * 4300;
    fractureTimer = window.setTimeout(() => {
      const targets = [...document.querySelectorAll("[data-crumble]")];
      const target = targets[Math.floor(Math.random() * targets.length)];
      if (target) {
        target.classList.add("fracture-active");
        window.setTimeout(() => target.classList.remove("fracture-active"), 850);
      }
      scheduleFracture();
    }, delay);
  }

  function prepareReveals() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const targets = document.querySelectorAll(".horror-card,.song-layout,.sprite-grid,.end-record__inner");
    targets.forEach(target => target.classList.add("reveal-target"));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    targets.forEach(target => observer.observe(target));
  }

  menuToggle.addEventListener("click", toggleMenu);
  dockToggle.addEventListener("click", toggleMenu);
  gateButton.addEventListener("click", () => playMenu({ manual: true }));
  menuAudio.addEventListener("play", setMenuState);
  menuAudio.addEventListener("pause", setMenuState);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      hiddenWasPlaying = !menuAudio.paused;
      menuAudio.pause();
      trackAudios.forEach(audio => audio.pause());
    } else if (hiddenWasPlaying && !menuManuallyPaused) {
      playMenu();
    }
  });

  window.addEventListener("pagehide", () => {
    menuAudio.pause();
    trackAudios.forEach(audio => audio.pause());
  });

  prepareCrumble();
  prepareReveals();
  scheduleFracture();
  setMenuState();

  window.setTimeout(() => {
    playMenu().catch(() => {});
  }, 350);
})();
