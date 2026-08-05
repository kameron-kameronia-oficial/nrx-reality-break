(function () {
  const ORIGINAL_TITLE = 'Aurora | NRX : Reality Break';
  const STRONG_START = 86.4;
  const STRONG_END = 123.6;
  const GLITCH_COUNT = 40;
  const URL_NORMAL = 'https://kameron-kameronia-oficial.github.io/nrx-reality-break/personajes/aurora.html';
  const CORRUPT_TITLES = [
    'AURORA // REWRITE',
    'AUR0RA | NRX : R3ALITY BR3AK',
    'AURORA [SIGNAL LOST]',
    'AURORA // CORRUPTED',
    'NRX : R3ALITY BR3AK',
    'AURORA // FALSE-TREASURE'
  ];
  const CORRUPT_URLS = [
    'https://kameron-kameronia-oficial.github.io/nrx-r3ality-br3ak/personajes/aur0ra.html',
    'https://rewrite.local/aurora/false-treasure/signal-lost',
    'https://kameron-kameronia-oficial.github.io/NRX/%5BAURORA_CORRUPTED%5D',
    'https://kameron-kameronia-oficial.github.io/nrx-reality-break/personajes/aurora.html#REWRITE',
    'https://kameron-kameronia-oficial.github.io/nrx-reality-break/personajes/404-AURORA.html'
  ];
  const THEME_COLORS = ['#8d48ff', '#ff315f', '#39a7ff', '#ffffff', '#12061d'];
  const GLITCH_EFFECTS = [
    'glitch-text-rgb-split',
    'glitch-text-color-flash',
    'glitch-text-jitter',
    'glitch-text-fracture',
    'glitch-url-bar-glitch',
    'glitch-url-bar-corrupt-text',
    'glitch-screen-crack-overlay',
    'glitch-shard-flash',
    'glitch-scanline-distortion',
    'glitch-screen-shift',
    'glitch-frame-tear',
    'glitch-color-invert-pulse',
    'glitch-vignette-danger',
    'glitch-glow-burst',
    'glitch-corrupted-title',
    'glitch-fake-browser-shake',
    'glitch-broken-ui-panels',
    'glitch-random-word-accent',
    'glitch-glitch-mask-slices',
    'glitch-crack-fade'
  ];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const demo = document.getElementById('aurora-demo-audio');
  const gate = document.querySelector('[data-entry-gate]');
  const gateStart = document.querySelector('[data-entry-start]');
  const toggle = document.querySelector('[data-demo-toggle]');
  const mute = document.querySelector('[data-demo-mute]');
  const timeLabel = document.querySelector('[data-demo-time]');
  const progress = document.querySelector('.aurora-progress');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const urlText = document.querySelector('[data-url-text]');
  const urlStatus = document.querySelector('[data-url-status]');
  const exclusive = Array.from(document.querySelectorAll('[data-exclusive-audio]'));
  const targets = Array.from(document.querySelectorAll('[data-glitch-target]'));
  const oldTargetEffects = ['fx-shift-x', 'fx-shift-y', 'fx-skew', 'fx-blur', 'fx-invert', 'fx-hue', 'fx-ghost', 'fx-slice', 'fx-pulse', 'fx-noise', 'fx-mirror'];
  const bodyGlitchClasses = ['glitch-active', 'glitch-soft-reduced', ...GLITCH_EFFECTS];

  let demoWasPlaying = false;
  let loopSession = 0;
  let timeline = buildGlitchTimeline();
  let firedEvents = new Set();
  let activeGlitches = new Map();
  let activeSignature = '';
  let lastAudioTime = 0;

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function shuffle(items) {
    return [...items].sort(() => Math.random() - 0.5);
  }

  function sampleEffects() {
    if (reduceMotion) return ['glitch-soft-reduced', Math.random() > 0.45 ? 'glitch-corrupted-title' : 'glitch-url-bar-corrupt-text'];
    const amount = Math.random() > 0.66 ? 3 : 2;
    return shuffle(GLITCH_EFFECTS).slice(0, amount);
  }

  function buildGlitchTimeline() {
    const span = STRONG_END - STRONG_START;
    return Array.from({ length: GLITCH_COUNT }, (_, index) => {
      const cell = span / GLITCH_COUNT;
      const start = STRONG_START + index * cell + randomBetween(0, cell * 0.72);
      const durationMs = Math.round(randomBetween(1000, 2000));
      return {
        id: `${Date.now()}-${loopSession}-${index}`,
        index: index + 1,
        start: Math.min(start, STRONG_END - 0.22),
        durationMs,
        effects: sampleEffects(),
        targetIndex: Math.floor(Math.random() * Math.max(targets.length, 1)),
        x: `${Math.round(randomBetween(8, 92))}%`,
        y: `${Math.round(randomBetween(10, 86))}%`,
        offset: `${Math.round(randomBetween(4, 16)) * (Math.random() > 0.5 ? 1 : -1)}px`
      };
    }).sort((a, b) => a.start - b.start);
  }

  function formatTime(value) {
    if (!Number.isFinite(value)) return '00:00';
    const m = Math.floor(value / 60);
    const s = Math.floor(value % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  document.querySelectorAll('[data-kinetic]').forEach((element) => {
    if (element.dataset.kineticReady === 'true') return;
    const text = element.textContent;
    element.dataset.kineticReady = 'true';
    element.setAttribute('aria-label', text.trim());
    element.textContent = '';
    Array.from(text).forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'kinetic-char';
      span.style.setProperty('--char-i', index);
      span.style.setProperty('--char-delay', `${index * -0.035}s`);
      span.style.setProperty('--dissolve-delay', `${index * 0.02}s`);
      span.setAttribute('aria-hidden', 'true');
      span.textContent = char === ' ' ? '\u00a0' : char;
      element.appendChild(span);
    });
  });

  async function startDemo() {
    if (!demo) return;
    try {
      await demo.play();
      gate.hidden = true;
      toggle.textContent = 'II';
      toggle.setAttribute('aria-label', 'Pausar musica');
    } catch (error) {
      gate.hidden = false;
    }
  }

  function resetTimeline() {
    loopSession += 1;
    timeline = buildGlitchTimeline();
    firedEvents = new Set();
    clearGlitchState();
  }

  function applyGlitchRender() {
    bodyGlitchClasses.forEach((className) => document.body.classList.remove(className));
    document.body.classList.toggle('glitch-active', activeGlitches.size > 0);
    activeGlitches.forEach((event) => {
      event.effects.forEach((effect) => document.body.classList.add(effect));
    });

    if (!activeGlitches.size) {
      document.title = ORIGINAL_TITLE;
      if (themeMeta) themeMeta.setAttribute('content', '#8d48ff');
      if (urlText) urlText.textContent = URL_NORMAL;
      if (urlStatus) urlStatus.textContent = 'SECURE // AURORA';
      return;
    }

    const latest = Array.from(activeGlitches.values()).at(-1);
    document.body.style.setProperty('--glitch-duration', `${latest.durationMs}ms`);
    document.body.style.setProperty('--glitch-x', latest.x);
    document.body.style.setProperty('--glitch-y', latest.y);
    document.body.style.setProperty('--glitch-offset', latest.offset);
    if (themeMeta) themeMeta.setAttribute('content', THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)]);

    if (latest.effects.includes('glitch-corrupted-title') || Math.random() > 0.52) {
      document.title = CORRUPT_TITLES[Math.floor(Math.random() * CORRUPT_TITLES.length)];
    }
    if (urlText && (latest.effects.includes('glitch-url-bar-corrupt-text') || Math.random() > 0.5)) {
      urlText.textContent = CORRUPT_URLS[Math.floor(Math.random() * CORRUPT_URLS.length)];
    }
    if (urlStatus) urlStatus.textContent = `REWRITE EVENT ${String(latest.index).padStart(2, '0')} / 40`;
  }

  function triggerRandomGlitch(event) {
    const current = {
      ...event,
      effects: event.effects.length ? event.effects : sampleEffects(),
      durationMs: Math.round(randomBetween(1000, 2000))
    };
    activeGlitches.set(current.id, current);
    applyGlitchRender();
    window.setTimeout(() => {
      activeGlitches.delete(current.id);
      applyGlitchRender();
    }, current.durationMs);
  }

  function clearGlitchState() {
    activeGlitches.clear();
    activeSignature = '';
    targets.forEach((target) => {
      oldTargetEffects.forEach((effect) => target.classList.remove(effect));
      target.removeAttribute('data-glitch-event');
    });
    applyGlitchRender();
  }

  function scheduleAuroraGlitches(currentTime) {
    if (reduceMotion && firedEvents.size >= 12) return;
    if (currentTime < STRONG_START || currentTime >= STRONG_END) return;
    timeline.forEach((event) => {
      if (!firedEvents.has(event.id) && currentTime >= event.start) {
        firedEvents.add(event.id);
        triggerRandomGlitch(event);
      }
    });
  }

  function updatePhases(t) {
    document.body.classList.toggle('phase-motion', t >= 10 && t < STRONG_START);
    document.body.classList.toggle('phase-glitch', t >= STRONG_START && t < STRONG_END);
    document.body.classList.toggle('phase-restore', t >= STRONG_END && t < 124.9);
    document.body.classList.toggle('phase-chroma', t >= 124.9 && t < 163.22);
    document.body.classList.toggle('phase-dissolve', t >= 163.22);
    document.body.classList.toggle('phase-residual', t >= 166.6);

    if (t + 0.5 < lastAudioTime || (lastAudioTime > STRONG_END && t < STRONG_START)) resetTimeline();
    lastAudioTime = t;
    scheduleAuroraGlitches(t);

    const legacyActive = !reduceMotion ? timeline.filter((g) => t >= g.start && t < g.start + g.durationMs / 1000) : [];
    const signature = legacyActive.map((g) => g.id).join(',');
    if (signature === activeSignature) return;
    activeSignature = signature;
    targets.forEach((target) => oldTargetEffects.forEach((effect) => target.classList.remove(effect)));
    legacyActive.forEach((g) => {
      const target = targets[g.targetIndex];
      const effect = oldTargetEffects[(g.index + g.targetIndex) % oldTargetEffects.length];
      if (target) {
        target.classList.add(effect);
        target.style.setProperty('--fx-duration', `${Math.max(0.18, g.durationMs / 5000)}s`);
        target.dataset.glitchEvent = String(g.index);
      }
    });
  }

  toggle?.addEventListener('click', async () => {
    if (!demo) return;
    if (demo.paused) await startDemo();
    else {
      demo.pause();
      clearGlitchState();
      toggle.textContent = 'PLAY';
      toggle.setAttribute('aria-label', 'Reproducir musica');
    }
  });

  mute?.addEventListener('click', () => {
    if (!demo) return;
    demo.muted = !demo.muted;
    mute.textContent = demo.muted ? 'MUTE' : 'SOUND';
    mute.setAttribute('aria-label', demo.muted ? 'Activar sonido' : 'Silenciar musica');
  });

  gateStart?.addEventListener('click', startDemo);
  demo?.addEventListener('seeked', () => {
    if (demo.currentTime < STRONG_START || demo.currentTime > STRONG_END) resetTimeline();
  });
  demo?.addEventListener('pause', clearGlitchState);
  demo?.addEventListener('ended', resetTimeline);

  exclusive.forEach((audio) => {
    audio.addEventListener('play', () => {
      exclusive.forEach((other) => {
        if (other !== audio) other.pause();
      });
      if (demo && !demo.paused) {
        demoWasPlaying = true;
        demo.pause();
        toggle.textContent = 'PLAY';
        clearGlitchState();
      }
    });
    audio.addEventListener('ended', () => {
      if (demoWasPlaying) {
        demoWasPlaying = false;
        startDemo();
      }
    });
    audio.addEventListener('pause', () => {
      if (audio.currentTime > 0 && audio.currentTime < audio.duration && demoWasPlaying) {
        demoWasPlaying = false;
        startDemo();
      }
    });
  });

  function tick() {
    if (demo) {
      const duration = Number.isFinite(demo.duration) ? demo.duration : 178.08;
      if (timeLabel) timeLabel.textContent = `${formatTime(demo.currentTime)} / ${formatTime(duration)}`;
      if (progress) progress.style.width = `${Math.min(100, (demo.currentTime / duration) * 100)}%`;
      updatePhases(demo.currentTime);
    }
    requestAnimationFrame(tick);
  }

  document.querySelectorAll('[data-lightbox]').forEach((button) => button.addEventListener('click', () => {
    const dialog = document.querySelector('[data-lightbox-dialog]');
    const image = document.querySelector('[data-lightbox-image]');
    if (dialog && image) {
      image.src = button.dataset.lightbox;
      dialog.showModal();
    }
  }));
  document.querySelector('[data-lightbox-close]')?.addEventListener('click', () => document.querySelector('[data-lightbox-dialog]')?.close());
  document.querySelector('[data-lightbox-dialog]')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  });

  window.__auroraGlitchDebug = {
    buildGlitchTimeline,
    scheduleAuroraGlitches,
    triggerRandomGlitch,
    clearGlitchState,
    getTimeline: () => timeline.map((event) => ({ start: event.start, durationMs: event.durationMs, effects: event.effects })),
    getActiveCount: () => activeGlitches.size
  };

  window.addEventListener('load', startDemo, { once: true });
  tick();
})();
