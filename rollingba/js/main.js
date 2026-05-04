// ── Countdown ──
const eventDate = new Date('2026-09-20T09:00:00-03:00');

function updateCountdown() {
  const diff = eventDate - new Date();
  if (diff <= 0) {
    document.querySelectorAll('.countdown-number').forEach(el => el.textContent = '00');
    return;
  }
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('cd-days').textContent    = pad(Math.floor(diff / 86400000));
  document.getElementById('cd-hours').textContent   = pad(Math.floor((diff % 86400000) / 3600000));
  document.getElementById('cd-minutes').textContent = pad(Math.floor((diff % 3600000) / 60000));
  document.getElementById('cd-seconds').textContent = pad(Math.floor((diff % 60000) / 1000));
}

if (document.getElementById('cd-days')) {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// ── Nav ──
const navCta = document.getElementById('navCta');
if (navCta) {
  const updateCta = () => navCta.style.display = window.innerWidth > 768 ? 'inline-flex' : 'none';
  updateCta();
  window.addEventListener('resize', updateCta);
}

// ── Hamburguesa ──
const toggle = document.getElementById('navToggle');
const links  = document.getElementById('navLinks');
if (toggle && links) {
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  // Close on link click
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
}

// ── Animaciones de scroll ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.anim').forEach(el => observer.observe(el));

// ── Formulario de inscripcion ──
const form = document.getElementById('inscripcionForm');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    this.style.display = 'none';
    const msg = document.getElementById('successMsg');
    if (msg) msg.style.display = 'block';
  });
}

// ── Animacion rollerskater del Footer ──
(function () {
  const skater  = document.getElementById('footerSkater');
  const dgn     = document.getElementById('footerDgn');
  const wrap    = document.getElementById('skaterWrap');
  if (!skater || !dgn || !wrap) return;

  const SKATER_W   = 26;   
  const SPEED      = 60;   
  const PAUSE_MS   = 2200;
  const ERASED_GAP = 0.2;
  const EXTRA      = 40;   // 👉 cuánto se pasa en ambos lados

  let pos      = 0;
  let dir      = 1;
  let target   = 0;
  let minX     = 0;
  let pausing  = false;
  let raf      = null;
  let lastTs   = null;
  let dgnLeft  = 0;

  function setup() {
    skater.style.background = 'transparent';
    skater.style.display = 'block';
    skater.style.position = 'absolute';

    dgnLeft = SKATER_W + 50;
    dgn.style.position  = 'absolute';
    dgn.style.left      = dgnLeft + 'px';
    dgn.style.top       = '50%';
    dgn.style.transform = 'translateY(-50%)';
    dgn.style.clipPath  = 'none';
    dgn.style.opacity   = '1';

    requestAnimationFrame(() => {
      const wrapW = wrap.offsetWidth;
      const dgnW = dgn.scrollWidth;

      target = dgnLeft + dgnW + EXTRA;
      minX   = -EXTRA;

      startLoop();
    });
  }

  function setSkaterPos(x, facingRight, time = 0) {
    skater.style.left = x + 'px';
    skater.style.top  = '50%';

    const bob  = Math.sin(time * 10) * 2;
    const tilt = Math.sin(time * 10) * 3;

    skater.style.transform = facingRight
      ? `translateY(calc(-50% + ${bob}px)) rotate(${tilt}deg) scaleX(1)`
      : `translateY(calc(-50% + ${bob}px)) rotate(${-tilt}deg) scaleX(-1)`;
  }

  function updateDgn(skaterX) {
    const dgnW = dgn.scrollWidth;

    const skaterLeft  = skaterX - ERASED_GAP;
    const skaterRight = skaterX + SKATER_W + ERASED_GAP;

    if (dir === 1) {
      const progress = skaterRight - dgnLeft;
      const clamped  = Math.max(0, Math.min(progress, dgnW));
      const pct      = (clamped / dgnW) * 100;

      dgn.style.clipPath = `inset(0 0 0 ${pct}%)`;

    } else {
      const progress = (dgnLeft + dgnW) - skaterLeft;
      const clamped  = Math.max(0, Math.min(progress, dgnW));
      const pct      = (clamped / dgnW) * 100;

      dgn.style.clipPath = `inset(0 ${pct}% 0 0)`;
    }
  }

  function tick(ts) {
    if (pausing) return;

    if (lastTs === null) lastTs = ts;
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;

    const step = SPEED * dt * dir;
    pos += step;

    if (dir === 1 && pos >= target) {
      pos    = target;
      dir    = -1;
      lastTs = null;

    } else if (dir === -1 && pos <= minX) {
      pos = minX;
      dir = 1;
      lastTs = null;
    }

    setSkaterPos(pos, dir === 1, ts / 1000);
    updateDgn(pos);

    raf = requestAnimationFrame(tick);
  }

  function startLoop() {
    setSkaterPos(0, true, 0);
    updateDgn(0);

    setTimeout(() => {
      lastTs = null;
      raf = requestAnimationFrame(tick);
    }, 800);
  }

  setup();
})();