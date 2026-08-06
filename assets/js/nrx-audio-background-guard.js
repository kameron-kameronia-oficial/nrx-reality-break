(() => {
  "use strict";

  if (window.__NRX_AUDIO_BACKGROUND_GUARD__) return;
  window.__NRX_AUDIO_BACKGROUND_GUARD__ = true;

  const capturePlayingMedia = () =>
    [...document.querySelectorAll("audio, video")]
      .filter(media => !media.paused && !media.ended)
      .map(media => ({
        media,
        currentTime: Number.isFinite(media.currentTime) ? media.currentTime : 0,
        playbackRate: media.playbackRate
      }));

  const preservePlayback = () => {
    const playingBeforeHide = capturePlayingMedia();
    if (!playingBeforeHide.length) return;

    window.setTimeout(() => {
      for (const state of playingBeforeHide) {
        const media = state.media;

        if (!media.isConnected || media.ended) continue;

        media.playbackRate = state.playbackRate;

        if (media.paused) {
          media.play().catch(() => {
            // El navegador puede imponer límites propios en dispositivos móviles.
          });
        }
      }
    }, 0);
  };

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) preservePlayback();
    },
    true
  );

  window.addEventListener("blur", preservePlayback, true);
})();
