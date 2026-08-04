(() => {
  "use strict";

  const video = document.getElementById("deletedVideo");
  if (!video) return;

  const excluded = "script,style,canvas,video,audio,source,noscript,iframe,input,textarea,select,option,#deletedTitle,.nrx-letter";

  function wrapPageLetters() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent || parent.closest(excluded)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    let globalIndex = 0;
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      [...node.nodeValue].forEach(char => {
        if (/\s/.test(char)) {
          fragment.appendChild(document.createTextNode(char));
          return;
        }
        const span = document.createElement("span");
        span.className = "nrx-letter";
        span.textContent = char;
        span.style.setProperty("--nrx-letter-delay", `${(globalIndex % 23) * 24}ms`);
        fragment.appendChild(span);
        globalIndex += 1;
      });
      node.replaceWith(fragment);
    });
  }

  const oldRain = document.getElementById("rainCanvas");
  if (oldRain) oldRain.hidden = true;

  const canvas = document.createElement("canvas");
  canvas.id = "nrxGlobalRain";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const context = canvas.getContext("2d");
  let drops = [];
  let frame = 0;
  let running = false;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(innerWidth * ratio));
    canvas.height = Math.max(1, Math.floor(innerHeight * ratio));
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    drops = Array.from({ length: Math.max(90, Math.floor(innerWidth / 8)) }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      speed: 8 + Math.random() * 14,
      length: 12 + Math.random() * 30,
      alpha: .18 + Math.random() * .5
    }));
  }

  function draw() {
    if (!running) return;
    context.clearRect(0, 0, innerWidth, innerHeight);
    context.lineWidth = 1.15;

    drops.forEach(drop => {
      context.strokeStyle = `rgba(115,205,255,${drop.alpha})`;
      context.beginPath();
      context.moveTo(drop.x, drop.y);
      context.lineTo(drop.x - 5, drop.y + drop.length);
      context.stroke();

      drop.y += drop.speed;
      drop.x -= 1.35;
      if (drop.y > innerHeight + 35 || drop.x < -40) {
        drop.y = -35;
        drop.x = Math.random() * (innerWidth + 100);
      }
    });

    frame = requestAnimationFrame(draw);
  }

  function startRain() {
    if (running) return;
    running = true;
    resize();
    cancelAnimationFrame(frame);
    draw();
  }

  function stopRain() {
    running = false;
    cancelAnimationFrame(frame);
    context.clearRect(0, 0, innerWidth, innerHeight);
  }

  function sync() {
    const active = video.currentTime >= 58 && video.currentTime < 287;
    document.body.classList.toggle("deleted-global-active", active);
    if (active) startRain(); else stopRain();
  }

  wrapPageLetters();
  resize();
  ["timeupdate", "seeked", "play", "pause", "loadedmetadata"].forEach(eventName => {
    video.addEventListener(eventName, sync);
  });
  video.addEventListener("ended", () => {
    document.body.classList.remove("deleted-global-active");
    stopRain();
  });
  window.addEventListener("resize", () => {
    if (running) resize();
  });
  sync();
})();