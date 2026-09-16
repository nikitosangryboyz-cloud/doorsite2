/* DOORSITE2 — CINEMATIC MOTION
   Vanilla JS, RAF + IntersectionObserver. No framework dependency.
*/
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const hero = $('.hero');
  if (!hero) return;

  document.body.classList.add('motion-ready');

  // Hero entrance: deliberate sequence instead of everything appearing at once.
  requestAnimationFrame(() => {
    hero.classList.add('is-loaded');
  });

  if (reduce) return;

  // Turn existing content into a coherent reveal system.
  const reveal = [
    ...$$('.section-head'),
    ...$$('.proof-grid article'),
    ...$$('.door-card'),
    ...$$('.rec-card'),
    ...$$('.service-card'),
    ...$$('.process-image'),
    ...$$('.showroom-copy'),
    ...$$('.review-grid article'),
    ...$$('.price-card, .trust-card'),
    ...$$('.calc-card, .calc-image'),
    ...$$('.about .metric-box')
  ];

  reveal.forEach((el, i) => {
    if (el.classList.contains('reveal')) return;
    el.classList.add('motion-reveal');
    el.dataset.delay = String(Math.min(i % 4, 3));
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveal.forEach(el => io.observe(el));
  } else {
    reveal.forEach(el => el.classList.add('is-visible'));
  }

  // Hero scroll choreography. One RAF loop services every scroll effect.
  hero.dataset.scrollMotion = 'true';
  let ticking = false;
  const update = () => {
    ticking = false;
    const r = hero.getBoundingClientRect();
    const h = Math.max(hero.offsetHeight, 1);
    const progress = Math.max(0, Math.min(1, -r.top / h));
    const y = progress * 48;
    const scale = progress * .045;
    const fade = 1 - Math.max(0, Math.min(1, progress * 1.35));
    hero.style.setProperty('--hero-y', `${y.toFixed(2)}px`);
    hero.style.setProperty('--hero-scale', scale.toFixed(4));
    hero.style.setProperty('--hero-fade', fade.toFixed(3));
    hero.style.setProperty('--hero-copy-y', `${progress * -34}px`);
    hero.style.setProperty('--hero-bottom-y', `${progress * 26}px`);

    // Process sequence: each image receives a slightly different depth.
    $$('#process .process-image').forEach((el, i) => {
      const er = el.getBoundingClientRect();
      const center = er.top + er.height / 2;
      const distance = Math.abs(center - innerHeight * .55);
      const active = distance < er.height * .62;
      el.classList.toggle('is-active', active);
      const drift = Math.max(-14, Math.min(14, (center - innerHeight * .55) * -0.018));
      el.style.setProperty('--process-drift', `${drift.toFixed(2)}px`);
      el.style.transform = `translate3d(0, calc(var(--process-y, 0px) + var(--process-drift, 0px)), 0)`;
    });

    // Image parallax, kept intentionally small to avoid nausea.
    $$('[data-parallax-image]').forEach(el => {
      const er = el.getBoundingClientRect();
      const centerDelta = (er.top + er.height / 2) - innerHeight / 2;
      const py = Math.max(-22, Math.min(22, centerDelta * -0.035));
      el.style.setProperty('--parallax-y', `${py.toFixed(2)}px`);
    });
  };

  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  update();

  // Desktop catalogue interaction: image follows the pointer by a few pixels.
  if (window.matchMedia('(pointer:fine)').matches) {
    $$('.door-card').forEach(card => {
      const visual = $('.door-visual', card);
      if (!visual) return;
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        visual.style.transform = `scale(1.018) translate3d(${(x * 8).toFixed(1)}px, ${(y * 6).toFixed(1)}px, 0)`;
      });
      card.addEventListener('pointerleave', () => {
        visual.style.transform = '';
      });
    });
  }
})();
