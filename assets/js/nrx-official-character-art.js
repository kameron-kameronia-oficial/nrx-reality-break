(function () {
  "use strict";

  const characters = [
    { id: "kamer", file: "kamer.png", match: "personajes/kamer.html", alt: "Kamer" },
    { id: "camila", file: "camila.png", match: "personajes/camila.html", alt: "Camila" },
    { id: "estefania", file: "estefania.png", match: "personajes/maria-estefania.html", alt: "Estefanía" },
    { id: "aurora", file: "aurora.png", match: "personajes/aurora.html", alt: "Aurora" }
  ];

  function cleanHref(value) {
    return String(value || "").split("?")[0].split("#")[0].replace(/^\.\//, "");
  }

  function installArt(card, info) {
    if (!card || card.dataset.nrxOfficialArt === "1") return;

    card.dataset.nrxOfficialArt = "1";
    card.dataset.nrxCharacter = info.id;
    card.classList.add("nrx-official-art-ready");

    const old = card.querySelector(".nrx-official-art-wrap");
    if (old) old.remove();

    const wrap = document.createElement("span");
    wrap.className = "nrx-official-art-wrap";
    wrap.setAttribute("aria-hidden", "true");

    const img = document.createElement("img");
    img.className = "nrx-official-art";
    img.src = "assets/media/official/characters/" + info.file;
    img.alt = "";
    img.loading = "eager";
    img.decoding = "async";

    wrap.appendChild(img);

    const num = card.querySelector(".archive-num");
    if (num) card.insertBefore(wrap, num);
    else card.appendChild(wrap);
  }

  function apply() {
    const cards = Array.from(document.querySelectorAll("a.archive[href]"));

    for (const info of characters) {
      const card = cards.find((el) => {
        const href = cleanHref(el.getAttribute("href"));
        return href.endsWith(info.match) || href === info.match;
      });
      installArt(card, info);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply, { once: true });
  } else {
    apply();
  }

  // Reaplicar si otro script reconstruye las tarjetas.
  const observer = new MutationObserver(() => apply());
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();