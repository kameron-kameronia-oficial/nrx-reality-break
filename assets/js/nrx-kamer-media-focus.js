(() => {
  "use strict";

  if (window.__NRX_KAMER_MEDIA_FOCUS__) return;
  window.__NRX_KAMER_MEDIA_FOCUS__ = true;

  const menuAudioId = "kamer-exclusive-audio";
  let shouldResumeMenu = false;
  let resumeTimer = 0;

  const getMenuAudio = () => document.getElementById(menuAudioId);

  const mediaElements = () =>
    Array.from(document.querySelectorAll("audio, video"))
      .filter((el) => el instanceof HTMLMediaElement);

  const foregroundMedia = () => {
    const menu = getMenuAudio();
    return mediaElements().filter((media) => media !== menu);
  };

  const anyForegroundPlaying = () =>
    foregroundMedia().some(
      (media) => !media.paused && !media.ended && media.readyState > 0
    );

  const stopResumeTimer = () => {
    if (resumeTimer) {
      window.clearTimeout(resumeTimer);
      resumeTimer = 0;
    }
  };

  const pauseEverythingExcept = (current) => {
    const menu = getMenuAudio();

    for (const media of mediaElements()) {
      if (media === current || media === menu) continue;
      if (!media.paused && !media.ended) {
        media.pause();
      }
    }
  };

  const pauseMenuForForeground = () => {
    const menu = getMenuAudio();
    if (!menu) return;

    stopResumeTimer();

    if (!menu.paused && !menu.ended) {
      shouldResumeMenu = true;
      menu.pause();
    }
  };

  const maybeResumeMenu = () => {
    stopResumeTimer();

    resumeTimer = window.setTimeout(() => {
      resumeTimer = 0;

      const menu = getMenuAudio();
      if (!menu) return;

      // No reanudar mientras exista otro audio/video sonando.
      if (anyForegroundPlaying()) return;

      // Solo reanudar si el menú estaba sonando antes de que
      // el usuario iniciara el video/canción.
      if (!shouldResumeMenu) return;

      shouldResumeMenu = false;

      menu.play().catch(() => {
        // Si el navegador bloquea el play automático, dejamos el menú pausado.
      });
    }, 80);
  };

  document.addEventListener(
    "play",
    (event) => {
      const current = event.target;
      if (!(current instanceof HTMLMediaElement)) return;

      const menu = getMenuAudio();

      // Si intentan arrancar el menú mientras un video/canción sigue
      // sonando, mantener el menú en pausa.
      if (current === menu) {
        if (anyForegroundPlaying()) {
          window.setTimeout(() => {
            if (!menu.paused) menu.pause();
          }, 0);
        }
        return;
      }

      // Si arranca un video/canción:
      // 1) pausar otros medios secundarios,
      // 2) pausar el menú de Kamer.
      pauseEverythingExcept(current);
      pauseMenuForForeground();
    },
    true
  );

  document.addEventListener(
    "pause",
    (event) => {
      const current = event.target;
      if (!(current instanceof HTMLMediaElement)) return;
      if (current === getMenuAudio()) return;

      maybeResumeMenu();
    },
    true
  );

  document.addEventListener(
    "ended",
    (event) => {
      const current = event.target;
      if (!(current instanceof HTMLMediaElement)) return;
      if (current === getMenuAudio()) return;

      maybeResumeMenu();
    },
    true
  );

  // Si se cambia de source/medio y ya no está reproduciendo,
  // también podemos devolver el audio del menú.
  document.addEventListener(
    "emptied",
    (event) => {
      const current = event.target;
      if (!(current instanceof HTMLMediaElement)) return;
      if (current === getMenuAudio()) return;

      maybeResumeMenu();
    },
    true
  );
})();