(() => {
  "use strict";
  const media = [...document.querySelectorAll("audio, video")];
  media.forEach((item) => item.addEventListener("play", () => {
    media.forEach((other) => { if (other !== item && !other.paused) other.pause(); });
    document.body.dataset.playing = item.dataset.track || "media";
  }));
  media.forEach((item) => item.addEventListener("pause", () => {
    if (media.every((node) => node.paused)) delete document.body.dataset.playing;
  }));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting));
  }, {threshold:.12});
  document.querySelectorAll("[data-reveal]").forEach((node) => observer.observe(node));
  document.querySelectorAll("[data-lightbox]").forEach((image) => image.addEventListener("click", () => {
    const dialog = document.querySelector("#archiveLightbox");
    const target = dialog?.querySelector("img");
    if (!dialog || !target) return;
    target.src = image.currentSrc || image.src;
    target.alt = image.alt || "Archivo visual";
    dialog.showModal();
  }));
  document.querySelectorAll("[data-close-lightbox]").forEach((button) => button.addEventListener("click", () => button.closest("dialog")?.close()));
})();