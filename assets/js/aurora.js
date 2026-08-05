(function () {
  const page = document.querySelector('[data-page="aurora"]');
  if (!page) return;

  const ORIGINAL_TITLE = 'Aurora | NRX : Reality Break';
  const AURORA_BPM = 200;
  const BEAT_DURATION = 60 / AURORA_BPM;
  const HALF_BEAT = BEAT_DURATION / 2;
  const GLITCH_START_TIME = 86.4;
  const GLITCH_END_TIME = 123.6;
  const GLITCH_START_BEAT = 288;
  const GLITCH_END_BEAT = 412;
  const TOTAL_GLITCH_EVENTS = 40;
  const DEFAULT_DURATION = 178.08;
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
  const HEAVY_EFFECTS = new Set([
    'glitch-screen-crack-overlay',
    'glitch-frame-tear',
    'glitch-screen-shift',
    'glitch-color-invert-pulse',
    'glitch-glitch-mask-slices',
    'glitch-shard-flash'
  ]);
  const MEDIUM_EFFECTS = new Set([
    'glitch-url-bar-glitch',
    'glitch-fake-browser-shake',
    'glitch-broken-ui-panels',
    'glitch-vignette-danger',
    'glitch-text-fracture',
    'glitch-glow-burst'
  ]);
  const TARGET_EFFECTS = ['fx-shift-x', 'fx-shift-y', 'fx-skew', 'fx-blur', 'fx-invert', 'fx-hue', 'fx-ghost', 'fx-slice', 'fx-pulse', 'fx-noise', 'fx-mirror'];
  const bodyGlitchClasses = ['glitch-active', 'glitch-soft-reduced', ...GLITCH_EFFECTS];

  const controller = new AbortController();
  const signal = controller.signal;
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: 620px)');
  const reduceMotion = reduceMotionQuery.matches;
  const isMobileAurora = () => mobileQuery.matches;

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
  const kineticElements = Array.from(document.querySelectorAll('[data-kinetic]'));
  const lightboxButtons = Array.from(document.querySelectorAll('[data-lightbox]'));
  const lightboxDialog = document.querySelector('[data-lightbox-dialog]');
  const lightboxImage = document.querySelector('[data-lightbox-image]');
  const lightboxClose = document.querySelector('[data-lightbox-close]');

  let demoWasPlaying = false;
  let loopSession = 0;
  let timeline = [];
  let timelineBuilt = false;
  let nextGlitchIndex = 0;
  let runningEvents = [];
  let rafId = 0;
  let renderSignature = '';
  let targetSignature = '';
  let lastAudioTime = 0;

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function shuffle(items) {
    return [...items].sort(() => Math.random() - 0.5);
  }

  function beatToSeconds(beat) {
    return beat * BEAT_DURATION;
  }

  function secondsToBeat(seconds) {
    return seconds / BEAT_DURATION;
  }

  function quantizeToBeat(seconds) {
    return beatToSeconds(Math.round(secondsToBeat(seconds)));
  }

  function quantizeToHalfBeat(seconds) {
    return Math.round(seconds / HALF_BEAT) * HALF_BEAT;
  }

  function beatInMeasure(absoluteBeat) {
    return ((Math.floor(absoluteBeat) - 1) % 4) + 1;
  }

  function getIntensity(beatPosition, hasHalfBeat) {
    if (hasHalfBeat) return 'anticipation';
    if (beatPosition === 1) return 'strong';
    if (beatPosition === 3) return 'medium';
    return 'light';
  }

  function normalizeEffects(effects) {
    if (reduceMotion) {
      return ['glitch-soft-reduced', effects.includes('glitch-corrupted-title') ? 'glitch-corrupted-title' : 'glitch-url-bar-corrupt-text'];
    }

    const maxEffects = isMobileAurora() ? 2 : 3;
    const normalized = [];
    let heavyCount = 0;
    let mediumCount = 0;

    effects.forEach((effect) => {
      if (normalized.length >= maxEffects || normalized.includes(effect)) return;
      if (HEAVY_EFFECTS.has(effect)) {
        if (heavyCount >= 1) return;
        heavyCount += 1;
      }
      if (MEDIUM_EFFECTS.has(effect)) {
        if (heavyCount && mediumCount >= 1) return;
        mediumCount += 1;
      }
      normalized.push(effect);
    });

    return normalized.length ? normalized : ['glitch-text-rgb-split'];
  }

  function sampleEffects(intensity) {
    const pools = {
      strong: ['glitch-screen-crack-overlay', 'glitch-frame-tear', 'glitch-screen-shift', 'glitch-corrupted-title', 'glitch-url-bar-glitch', 'glitch-fake-browser-shake', 'glitch-glow-burst'],
      medium: ['glitch-vignette-danger', 'glitch-shard-flash', 'glitch-broken-ui-panels', 'glitch-text-fracture', 'glitch-url-bar-glitch'],
      light: ['glitch-text-rgb-split', 'glitch-text-jitter', 'glitch-text-color-flash', 'glitch-glitch-mask-slices', 'glitch-random-word-accent'],
      anticipation: ['glitch-url-bar-corrupt-text', 'glitch-text-jitter', 'glitch-frame-tear', 'glitch-glitch-mask-slices']
    };
    const amount = intensity === 'strong' ? 3 : 2;
    return normalizeEffects(shuffle(pools[intensity]).slice(0, amount + 1));
  }

  function buildBpmGlitchTimeline() {
    loopSession += 1;
    const beats = [];
    const beatSpan = GLITCH_END_BEAT - GLITCH_START_BEAT - 2;
    for (let index = 0; index < TOTAL_GLITCH_EVENTS; index += 1) {
      const base = GLITCH_START_BEAT + Math.round((index * beatSpan) / (TOTAL_GLITCH_EVENTS - 1));
      let adjusted = Math.min(GLITCH_END_BEAT - 1, Math.max(GLITCH_START_BEAT, base));
      while (beats.includes(adjusted) && adjusted < GLITCH_END_BEAT - 1) adjusted += 1;
      beats.push(adjusted);
    }

    const halfBeatSlots = new Set(shuffle(Array.from({ length: TOTAL_GLITCH_EVENTS - 1 }, (_, index) => index + 1)).slice(0, reduceMotion ? 2 : 4));

    return beats.map((baseBeat, index) => {
      const useHalfBeat = halfBeatSlots.has(index) && beatInMeasure(baseBeat) !== 1;
      const beat = useHalfBeat ? baseBeat + 0.5 : baseBeat;
      const position = beatInMeasure(beat);
      const intensity = getIntensity(position, useHalfBeat);
      const durationBeats = [4, 5, 6][Math.floor(Math.random() * 3)];
      const time = useHalfBeat ? quantizeToHalfBeat(beatToSeconds(beat)) : quantizeToBeat(beatToSeconds(beat));
      const targetIndex = Math.floor(Math.random() * Math.max(targets.length, 1));
      const effects = sampleEffects(intensity);

      return {
        id: `${loopSession}-${index}`,
        index: index + 1,
        beat,
        time,
        endTime: time + durationBeats * BEAT_DURATION,
        durationBeats,
        durationMs: Math.round(durationBeats * BEAT_DURATION * 1000),
        beatInMeasure: position,
        intensity,
        effects,
        targetIndex,
        target: targets[targetIndex] || null,
        targetEffect: reduceMotion ? '' : TARGET_EFFECTS[(index + targetIndex) % TARGET_EFFECTS.length],
        x: `${Math.round(randomBetween(8, 92))}%`,
        y: `${Math.round(randomBetween(10, 86))}%`,
        offset: `${Math.round(randomBetween(3, isMobileAurora() ? 8 : 14)) * (Math.random() > 0.5 ? 1 : -1)}px`
      };
    }).sort((a, b) => a.time - b.time);
  }

  function buildGlitchTimeline() {
    return buildBpmGlitchTimeline();
  }

  function ensureTimeline() {
    if (timelineBuilt) return;
    timeline = buildGlitchTimeline();
    timelineBuilt = true;
    nextGlitchIndex = 0;
    runningEvents = [];
  }

  function resetTimeline() {
    timeline = [];
    timelineBuilt = false;
    nextGlitchIndex = 0;
    runningEvents = [];
    clearGlitchState();
  }

  function formatTime(value) {
    if (!Number.isFinite(value)) return '00:00';
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function updatePlaybackUi() {
    if (!demo) return;
    const duration = Number.isFinite(demo.duration) ? demo.duration : DEFAULT_DURATION;
    if (timeLabel) timeLabel.textContent = `${formatTime(demo.currentTime)} / ${formatTime(duration)}`;
    if (progress) progress.style.setProperty('--aurora-progress', String(Math.min(1, demo.currentTime / duration)));
  }

  function updatePhases(t) {
    page.classList.toggle('phase-motion', t >= 10 && t < GLITCH_START_TIME);
    page.classList.toggle('phase-glitch', t >= GLITCH_START_TIME && t < GLITCH_END_TIME);
    page.classList.toggle('phase-restore', t >= GLITCH_END_TIME && t < 124.9);
    page.classList.toggle('phase-chroma', t >= 124.9 && t < 163.22);
    page.classList.toggle('phase-dissolve', t >= 163.22);
    page.classList.toggle('phase-residual', t >= 166.6);
  }

  function prepareKineticText() {
    kineticElements.forEach((element) => {
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
  }

  function clearTargetEffects() {
    targets.forEach((target) => {
      TARGET_EFFECTS.forEach((effect) => target.classList.remove(effect));
      target.removeAttribute('data-glitch-event');
    });
    targetSignature = '';
  }

  function clearGlitchState() {
    runningEvents = [];
    renderSignature = '';
    page.classList.remove(...bodyGlitchClasses);
    clearTargetEffects();
    document.title = ORIGINAL_TITLE;
    if (themeMeta) themeMeta.setAttribute('content', '#8d48ff');
    if (urlText) urlText.textContent = URL_NORMAL;
    if (urlStatus) urlStatus.textContent = 'SECURE // AURORA';
  }

  function limitActiveEvents(active) {
    const maxEffects = isMobileAurora() ? 2 : 3;
    const selected = [];
    let heavyActive = 0;
    let effectBudget = 0;

    for (let index = active.length - 1; index >= 0; index -= 1) {
      const event = active[index];
      const heavy = event.effects.some((effect) => HEAVY_EFFECTS.has(effect));
      const eventWeight = Math.max(1, event.effects.length);
      if (heavy && heavyActive >= 1) continue;
      if (effectBudget + eventWeight > maxEffects && selected.length) continue;
      selected.unshift(event);
      effectBudget += eventWeight;
      if (heavy) heavyActive += 1;
      if (selected.length >= 2) break;
    }

    return selected;
  }

  function applyGlitchRender(activeEvents) {
    const limitedActive = limitActiveEvents(activeEvents);
    const signature = limitedActive.map((event) => `${event.id}:${event.effects.join('+')}`).join('|');
    if (signature === renderSignature) return;
    renderSignature = signature;

    page.classList.remove(...bodyGlitchClasses);
    if (!limitedActive.length) {
      clearGlitchState();
      return;
    }

    const classSet = new Set(['glitch-active']);
    limitedActive.forEach((event) => event.effects.forEach((effect) => classSet.add(effect)));
    page.classList.add(...classSet);

    const latest = limitedActive[limitedActive.length - 1];
    page.style.setProperty('--glitch-duration', `${latest.durationMs}ms`);
    page.style.setProperty('--glitch-x', latest.x);
    page.style.setProperty('--glitch-y', latest.y);
    page.style.setProperty('--glitch-offset', latest.offset);
    if (themeMeta) themeMeta.setAttribute('content', THEME_COLORS[(latest.index + limitedActive.length) % THEME_COLORS.length]);
    if (urlStatus) urlStatus.textContent = `REWRITE EVENT ${String(latest.index).padStart(2, '0')} / 40`;
    if (urlText && (latest.effects.includes('glitch-url-bar-corrupt-text') || latest.index % 2 === 0)) {
      urlText.textContent = CORRUPT_URLS[latest.index % CORRUPT_URLS.length];
    }
    if (latest.effects.includes('glitch-corrupted-title') || latest.index % 3 === 0) {
      document.title = CORRUPT_TITLES[latest.index % CORRUPT_TITLES.length];
    }

    const nextTargetSignature = limitedActive.map((event) => `${event.targetIndex}:${event.targetEffect}:${event.index}`).join('|');
    if (nextTargetSignature === targetSignature) return;
    clearTargetEffects();
    targetSignature = nextTargetSignature;
    limitedActive.forEach((event) => {
      if (!event.target || !event.targetEffect) return;
      event.target.classList.add(event.targetEffect);
      event.target.style.setProperty('--fx-duration', `${Math.max(0.18, event.durationMs / 5000)}s`);
      event.target.dataset.glitchEvent = String(event.index);
    });
  }

  function seekTimelineTo(currentTime) {
    ensureTimeline();
    nextGlitchIndex = timeline.findIndex((event) => event.time > currentTime);
    if (nextGlitchIndex < 0) nextGlitchIndex = timeline.length;
    runningEvents = timeline.filter((event) => event.time <= currentTime && currentTime < event.endTime);
    applyGlitchRender(runningEvents);
  }

  function updateGlitchTimelineFromAudio(currentTime) {
    if (currentTime < GLITCH_START_TIME) {
      if (lastAudioTime > GLITCH_END_TIME || currentTime + 0.5 < lastAudioTime) resetTimeline();
      else clearGlitchState();
      lastAudioTime = currentTime;
      return;
    }

    ensureTimeline();

    if (currentTime >= GLITCH_END_TIME) {
      nextGlitchIndex = timeline.length;
      clearGlitchState();
      lastAudioTime = currentTime;
      return;
    }

    if (currentTime + 0.5 < lastAudioTime) seekTimelineTo(currentTime);

    while (nextGlitchIndex < timeline.length && timeline[nextGlitchIndex].time <= currentTime) {
      runningEvents.push(timeline[nextGlitchIndex]);
      nextGlitchIndex += 1;
    }

    runningEvents = runningEvents.filter((event) => currentTime < event.endTime);
    applyGlitchRender(runningEvents);
    lastAudioTime = currentTime;
  }

  function shouldRunTimeline() {
    return Boolean(demo && !demo.paused && document.visibilityState === 'visible' && demo.currentTime >= GLITCH_START_TIME && demo.currentTime < GLITCH_END_TIME);
  }

  function stopTimelineLoop(clearState = true) {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    if (clearState) clearGlitchState();
  }

  function updateAuroraTimeline() {
    rafId = 0;
    if (!shouldRunTimeline()) {
      stopTimelineLoop(true);
      return;
    }
    updatePlaybackUi();
    updatePhases(demo.currentTime);
    updateGlitchTimelineFromAudio(demo.currentTime);
    rafId = requestAnimationFrame(updateAuroraTimeline);
  }

  function startTimelineLoop() {
    if (!shouldRunTimeline()) return;
    ensureTimeline();
    if (!rafId) rafId = requestAnimationFrame(updateAuroraTimeline);
  }

  function handleTimeUpdate() {
    if (!demo) return;
    updatePlaybackUi();
    updatePhases(demo.currentTime);
    if (demo.currentTime < GLITCH_START_TIME || demo.currentTime >= GLITCH_END_TIME) {
      stopTimelineLoop(true);
      if (demo.currentTime >= GLITCH_END_TIME) clearGlitchState();
      return;
    }
    startTimelineLoop();
  }

  async function startDemo() {
    if (!demo) return;
    ensureTimeline();
    try {
      await demo.play();
      if (gate) gate.hidden = true;
      if (toggle) {
        toggle.textContent = 'II';
        toggle.setAttribute('aria-label', 'Pausar musica');
      }
      handleTimeUpdate();
    } catch (error) {
      if (gate) gate.hidden = false;
    }
  }

  function handlePause() {
    stopTimelineLoop(true);
    if (toggle) {
      toggle.textContent = 'PLAY';
      toggle.setAttribute('aria-label', 'Reproducir musica');
    }
  }

  function cleanup() {
    stopTimelineLoop(true);
    controller.abort();
  }

  prepareKineticText();
  updatePlaybackUi();

  toggle?.addEventListener('click', async () => {
    if (!demo) return;
    if (demo.paused) await startDemo();
    else {
      demo.pause();
      handlePause();
    }
  }, { signal });

  mute?.addEventListener('click', () => {
    if (!demo || !mute) return;
    demo.muted = !demo.muted;
    mute.textContent = demo.muted ? 'MUTE' : 'SOUND';
    mute.setAttribute('aria-label', demo.muted ? 'Activar sonido' : 'Silenciar musica');
  }, { signal });

  gateStart?.addEventListener('click', startDemo, { signal });

  demo?.addEventListener('play', () => {
    ensureTimeline();
    handleTimeUpdate();
  }, { signal });
  demo?.addEventListener('timeupdate', handleTimeUpdate, { signal });
  demo?.addEventListener('seeked', () => {
    if (!demo) return;
    if (demo.currentTime < GLITCH_START_TIME || demo.currentTime >= GLITCH_END_TIME) {
      if (demo.currentTime < GLITCH_START_TIME) resetTimeline();
      stopTimelineLoop(true);
      return;
    }
    seekTimelineTo(demo.currentTime);
    startTimelineLoop();
  }, { signal });
  demo?.addEventListener('pause', handlePause, { signal });
  demo?.addEventListener('ended', resetTimeline, { signal });

  exclusive.forEach((audio) => {
    audio.addEventListener('play', () => {
      exclusive.forEach((other) => {
        if (other !== audio) other.pause();
      });
      if (demo && !demo.paused) {
        demoWasPlaying = true;
        demo.pause();
        handlePause();
      }
    }, { signal });
    audio.addEventListener('ended', () => {
      if (demoWasPlaying) {
        demoWasPlaying = false;
        startDemo();
      }
    }, { signal });
    audio.addEventListener('pause', () => {
      if (audio.currentTime > 0 && audio.currentTime < audio.duration && demoWasPlaying) {
        demoWasPlaying = false;
        startDemo();
      }
    }, { signal });
  });

  lightboxButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!lightboxDialog || !lightboxImage) return;
      lightboxImage.src = button.dataset.lightbox || '';
      lightboxDialog.showModal();
    }, { signal });
  });
  lightboxClose?.addEventListener('click', () => lightboxDialog?.close(), { signal });
  lightboxDialog?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  }, { signal });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') {
      stopTimelineLoop(true);
      return;
    }
    handleTimeUpdate();
  }, { signal });
  window.addEventListener('pagehide', cleanup, { signal });
  window.addEventListener('beforeunload', cleanup, { signal });
  window.addEventListener('load', startDemo, { once: true, signal });

  window.__auroraGlitchDebug = {
    AURORA_BPM,
    BEAT_DURATION,
    HALF_BEAT,
    GLITCH_START_TIME,
    GLITCH_END_TIME,
    GLITCH_START_BEAT,
    GLITCH_END_BEAT,
    TOTAL_GLITCH_EVENTS,
    secondsToBeat,
    beatToSeconds,
    quantizeToBeat,
    quantizeToHalfBeat,
    buildBpmGlitchTimeline,
    buildGlitchTimeline,
    updateAuroraTimeline,
    updateGlitchTimelineFromAudio,
    startTimelineLoop,
    stopTimelineLoop,
    resetTimeline,
    clearGlitchState,
    seekTimelineTo,
    getTimeline: () => {
      ensureTimeline();
      return timeline.map((event) => ({
        index: event.index,
        beat: event.beat,
        time: event.time,
        endTime: event.endTime,
        durationBeats: event.durationBeats,
        durationMs: event.durationMs,
        beatInMeasure: event.beatInMeasure,
        intensity: event.intensity,
        effects: event.effects
      }));
    },
    getActiveCount: () => runningEvents.length,
    getNextGlitchIndex: () => nextGlitchIndex,
    isRafActive: () => Boolean(rafId),
    getNodeCount: () => document.querySelectorAll('*').length,
    isMobile: () => isMobileAurora(),
    isReducedMotion: () => reduceMotion
  };
})();
