(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progress = document.querySelector('.aurora-progress');
  if (progress) {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const value = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
      progress.style.width = `${value * 100}%`;
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
  }

  const conceptButtons = Array.from(document.querySelectorAll('[data-concept-tab]'));
  const conceptTitle = document.querySelector('[data-concept-title]');
  const conceptText = document.querySelector('[data-concept-text]');
  const conceptData = {
    luz: {
      title: 'Luz',
      text: 'La luz es el primer lenguaje visual confirmado de Aurora: atrae la mirada, revela detalles y tambien puede ocultar lo que queda fuera del foco.'
    },
    espectaculo: {
      title: 'Espect\u00e1culo',
      text: 'Su presentaci\u00f3n confirmada se apoya en una presencia teatral, como si cada aparici\u00f3n estuviera construida para ser observada.'
    },
    apariencia: {
      title: 'Apariencia falsa',
      text: 'La imagen perfecta forma parte del concepto confirmado: una superficie limpia que puede esconder una amenaza.'
    },
    reescritura: {
      title: 'Reescritura',
      text: 'La reescritura define el peligro asociado a Aurora, sin detallar a\u00fan reglas, alcance o acontecimientos can\u00f3nicos.'
    }
  };

  function setConcept(key, focusPanel) {
    const data = conceptData[key];
    if (!data || !conceptTitle || !conceptText) return;
    conceptButtons.forEach((button) => {
      const active = button.dataset.conceptTab === key;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    conceptTitle.textContent = data.title;
    conceptText.textContent = data.text;
    if (focusPanel) {
      document.querySelector('.concept-display')?.focus({ preventScroll: true });
    }
  }

  conceptButtons.forEach((button, index) => {
    button.addEventListener('click', () => setConcept(button.dataset.conceptTab, false));
    button.addEventListener('keydown', (event) => {
      const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
      if (!direction) return;
      event.preventDefault();
      const next = conceptButtons[(index + direction + conceptButtons.length) % conceptButtons.length];
      next.focus();
      setConcept(next.dataset.conceptTab, false);
    });
  });

  const classified = document.querySelector('[data-classified]');
  const classifiedButton = document.querySelector('[data-classified-toggle]');
  classifiedButton?.addEventListener('click', () => {
    const isOpen = classified?.classList.toggle('is-open') || false;
    classifiedButton.setAttribute('aria-expanded', String(isOpen));
    classifiedButton.textContent = isOpen ? 'CERRAR REGISTRO DE REESCRITURA' : 'ABRIR REGISTRO DE REESCRITURA';
  });

  if (!reduceMotion) {
    const stage = document.querySelector('.aurora-stage');
    window.addEventListener('pointermove', (event) => {
      if (!stage) return;
      const x = (event.clientX / window.innerWidth - .5) * 10;
      const y = (event.clientY / window.innerHeight - .5) * 10;
      stage.style.setProperty('--tilt-x', `${x.toFixed(2)}deg`);
      stage.style.setProperty('--tilt-y', `${y.toFixed(2)}deg`);
      stage.style.transform = `perspective(900px) rotateY(${x.toFixed(2)}deg) rotateX(${-y.toFixed(2)}deg)`;
    }, { passive: true });
  }
})();
