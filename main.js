/* ==========================================================================
   SHOWS: edit this list to add dates.
   date:    YYYY-MM-DD (shows disappear automatically the day after)
   tickets: optional link; leave '' to show "Free / at the door"
   ========================================================================== */
const SHOWS = [
  // { date: '2026-11-14', city: 'Omaha, NE', venue: 'The Waiting Room', tickets: 'https://example.com' },
  { date: '2025-10-09', city: 'Lincoln, NE', venue: '1867 Bar', tickets: '' },
];

/* Gallery photos, in display order */
const GALLERY = [
  ['red-crowd', 'The band on stage in red light with a packed crowd in front'],
  ['sweaters', 'Playing in holiday sweaters in a snowy park'],
  ['darren-2', 'Darren on drums through stage haze'],
  ['dave-keys', 'Dave playing keys under red stage light'],
  ['radio', 'Promo portrait of the four members in a wood-paneled room'],
  ['kyleplaying', 'Kyle playing a Les Paul under purple light'],
  ['daley-2', 'Daley on bass in teal light and smoke'],
  ['red-stairs', 'The band on a red carpeted staircase'],
  ['full-side', 'Wide side view of the full band on stage'],
  ['daleyplaying', 'Daley playing bass with a blue wash behind'],
  ['sweet-tree', 'The band standing among snowy evergreens'],
  ['dave-knees', 'Dave singing close to the drum kit'],
  ['heads-together', 'Four members lying head to head on a patterned rug'],
  ['kyle-1', 'Kyle playing guitar in green light'],
  ['tub', 'The band piled into a bathtub'],
  ['darrenplaying', 'Darren playing drums under blue light'],
  ['yellow-stairs', 'The band on an ornate staircase'],
  ['daveplaying', 'A singer at the microphone in white light'],
  ['band-1', 'All four members on stage at the 1867 Bar'],
  ['fullband', 'Full band live under purple lights'],
];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Shows ---------- */
(function renderShows() {
  const list = document.getElementById('show-list');
  const empty = document.getElementById('show-empty');
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const upcoming = SHOWS
    .map(s => ({ ...s, d: new Date(s.date + 'T00:00:00') }))
    .filter(s => s.d >= today)
    .sort((a, b) => a.d - b.d);

  if (!upcoming.length) { empty.hidden = false; return; }

  const month = new Intl.DateTimeFormat('en-US', { month: 'short' });
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' });

  list.innerHTML = upcoming.map(s => `
    <li class="show reveal">
      <p class="show__date"><span>${month.format(s.d)}</span><b>${s.d.getDate()}</b></p>
      <p class="show__where"><strong>${s.venue}</strong><span>${s.city} &middot; ${weekday.format(s.d)}</span></p>
      ${s.tickets
        ? `<a class="btn btn--black" href="${s.tickets}" target="_blank" rel="noopener">Tickets <svg class="icon"><use href="#i-arrow"/></svg></a>`
        : `<span class="btn btn--black" aria-disabled="true" style="cursor:default">At the door</span>`}
    </li>`).join('');
})();

/* ---------- Gallery + lightbox ---------- */
(function gallery() {
  const grid = document.getElementById('masonry');
  const box = document.getElementById('lightbox');
  const img = box.querySelector('.lightbox__img');
  const count = box.querySelector('.lightbox__count');
  let index = 0;
  let opener = null;

  grid.innerHTML = GALLERY.map(([file, alt], i) => `
    <button class="masonry__item" type="button" data-i="${i}" aria-label="Open photo: ${alt}">
      <img src="assets/img/${file}.webp" alt="${alt}" loading="lazy" decoding="async">
    </button>`).join('');

  function show(i) {
    index = (i + GALLERY.length) % GALLERY.length;
    const [file, alt] = GALLERY[index];
    img.src = `assets/img/${file}.webp`;
    img.alt = alt;
    count.textContent = `${index + 1} / ${GALLERY.length}`;
  }

  grid.addEventListener('click', e => {
    const btn = e.target.closest('.masonry__item');
    if (!btn) return;
    opener = btn;
    show(Number(btn.dataset.i));
    box.showModal();
  });

  box.querySelector('.lightbox__close').addEventListener('click', () => box.close());
  box.querySelector('.lightbox__prev').addEventListener('click', () => show(index - 1));
  box.querySelector('.lightbox__next').addEventListener('click', () => show(index + 1));
  box.addEventListener('click', e => { if (e.target === box) box.close(); });
  box.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  box.addEventListener('close', () => opener && opener.focus());
})();

/* ---------- Menu overlay ---------- */
(function menu() {
  const panel = document.getElementById('site-menu');
  const openers = document.querySelectorAll('[data-menu-open]');
  const closer = panel.querySelector('[data-menu-close]');
  let lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add('is-open'));
    document.body.classList.add('menu-open');
    openers.forEach(b => b.setAttribute('aria-expanded', 'true'));
    closer.focus();
  }
  function close(returnFocus = true) {
    panel.classList.remove('is-open');
    panel.hidden = true;
    document.body.classList.remove('menu-open');
    openers.forEach(b => b.setAttribute('aria-expanded', 'false'));
    if (returnFocus && lastFocus) lastFocus.focus();
  }

  openers.forEach(b => b.addEventListener('click', open));
  closer.addEventListener('click', () => close());
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => close(false)));

  panel.addEventListener('keydown', e => {
    if (e.key === 'Escape') return close();
    if (e.key !== 'Tab') return;
    const items = panel.querySelectorAll('button, a');
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();

/* ---------- Reveal on scroll ---------- */
(function reveal() {
  const els = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 60}ms`;
    io.observe(el);
  });
})();

document.getElementById('year').textContent = new Date().getFullYear();
