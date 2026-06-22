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
  const updateCta = () => { navCta.hidden = window.innerWidth < 960; };
  updateCta();
  window.addEventListener('resize', updateCta);
}

// ── Hamburguesa ──
const toggle = document.getElementById('navToggle');
const links  = document.getElementById('navLinks');
if (toggle && links) {
  toggle.addEventListener('click', () => links.classList.toggle('open'));
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
    this.hidden = true;
    const msg = document.getElementById('successMsg');
    if (msg) msg.hidden = false;
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
  const ERASED_GAP = 0.2;
  const EXTRA      = 40;

  let pos      = 0;
  let dir      = 1;
  let target   = 0;
  let minX     = 0;
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
    if (lastTs === null) lastTs = ts;
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;
    const step = SPEED * dt * dir;
    pos += step;
    if (dir === 1 && pos >= target) {
      pos = target; dir = -1; lastTs = null;
    } else if (dir === -1 && pos <= minX) {
      pos = minX; dir = 1; lastTs = null;
    }
    setSkaterPos(pos, dir === 1, ts / 1000);
    updateDgn(pos);
    raf = requestAnimationFrame(tick);
  }

  function startLoop() {
    setSkaterPos(0, true, 0);
    updateDgn(0);
    setTimeout(() => { lastTs = null; raf = requestAnimationFrame(tick); }, 800);
  }

  setup();
})();

// ── Animacion colectivo (ubicacion) ──
(function () {
  const bus  = document.getElementById('busVehicle');
  const wrap = document.getElementById('busWrap');
  if (!bus || !wrap) return;

  const BUS_W  = 110;
  const SPEED  = 80;
  const EXTRA  = 20;
  let pos    = 0;
  let dir    = 1;
  let lastTs = null;
  let target = 0;
  let minX   = 0;

  function setup() {
    requestAnimationFrame(() => {
      const wrapW = wrap.offsetWidth;
      target = wrapW + EXTRA;
      minX   = -BUS_W - EXTRA;
      pos    = minX;
      requestAnimationFrame(tick);
    });
  }

  function setBusPos(x, facingRight, time) {
    const bounce = Math.abs(Math.sin(time * 8)) * 1.2;
    bus.style.left      = x + 'px';
    bus.style.transform = facingRight
      ? `translateY(calc(-60% + ${bounce}px)) scaleX(1)`
      : `translateY(calc(-60% + ${bounce}px)) scaleX(-1)`;
  }

  function tick(ts) {
    if (lastTs === null) lastTs = ts;
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;
    pos += SPEED * dt * dir;
    if (dir === 1 && pos >= target) {
      pos = target; dir = -1; lastTs = null;
    } else if (dir === -1 && pos <= minX) {
      pos = minX; dir = 1; lastTs = null;
    }
    setBusPos(pos, dir === 1, ts / 1000);
    requestAnimationFrame(tick);
  }

  setup();
})();

// ── Visor 3D WD-40 ──
(function () {
  const canvas = document.getElementById('model-canvas');
  const hint   = document.getElementById('viewerHint');
  if (!canvas || typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100);
  camera.position.set(0, 0, 0.55);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
  dirLight1.position.set(2, 4, 3);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xc8d8ed, 1.2);
  dirLight2.position.set(-3, -1, 2);
  scene.add(dirLight2);

  const rimLight = new THREE.DirectionalLight(0xf5c100, 0.4);
  rimLight.position.set(0, -3, -2);
  scene.add(rimLight);

  function resize() {
    const wrap = canvas.parentElement;
    if (!wrap) return;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let isDragging   = false;
  let prevX = 0, prevY = 0;
  let rotX = -0.15, rotY = 0.3;
  let velX = 0, velY = 0;
  let autoRotate   = true;
  let hintHidden   = false;
  const AUTO_SPEED = 0.003;
  const DAMPING    = 0.88;

  canvas.addEventListener('pointerdown', e => {
    isDragging = true;
    prevX = e.clientX; prevY = e.clientY;
    autoRotate = false; velX = velY = 0;
    if (!hintHidden) { hintHidden = true; hint.classList.add('hidden'); }
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    velX = dy * 0.008; velY = dx * 0.008;
    rotX += velX; rotY += velY;
    rotX = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotX));
    prevX = e.clientX; prevY = e.clientY;
  });

  canvas.addEventListener('pointerup',     () => { isDragging = false; });
  canvas.addEventListener('pointercancel', () => { isDragging = false; });

  let lastTouch = null;
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    autoRotate = false;
    if (!hintHidden) { hintHidden = true; hint.classList.add('hidden'); }
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!lastTouch) return;
    const dx = e.touches[0].clientX - lastTouch.x;
    const dy = e.touches[0].clientY - lastTouch.y;
    velX = dy * 0.008; velY = dx * 0.008;
    rotX = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotX + velX));
    rotY += velY;
    lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: false });

  canvas.addEventListener('touchend', () => { lastTouch = null; });

  const loader = new THREE.GLTFLoader();
  let modelGroup = null;

  function setupLoadedModel(gltf) {
    const group = gltf.scene;
    group.traverse(child => {
      if (child.isMesh) {
        const geo = child.geometry;
        if (geo && !geo.attributes.normal) geo.computeVertexNormals();
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(m => { if (m) m.side = THREE.DoubleSide; });
      }
    });
    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (!maxDim || !isFinite(maxDim)) throw new Error('Invalid model bounds');
    const scale = (0.35 * 0.75) / maxDim;
    group.scale.setScalar(scale);
    const center = box.getCenter(new THREE.Vector3());
    group.position.sub(center.multiplyScalar(scale));
    group.rotation.x = 0.1;
    return group;
  }

  function dataUrlToArrayBuffer(dataUrl) {
    const commaIdx = dataUrl.indexOf(',');
    const b64 = dataUrl.slice(commaIdx + 1);
    const binStr = atob(b64);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
    return bytes.buffer;
  }

  if (typeof window.WD40_GLB_DATA_URL === 'string') {
    try {
      const buffer = dataUrlToArrayBuffer(window.WD40_GLB_DATA_URL);
      loader.parse(buffer, '', (gltf) => {
        modelGroup = setupLoadedModel(gltf);
        scene.add(modelGroup);
      }, (err) => console.error('GLTFLoader.parse error:', err));
    } catch (err) {
      console.error('base64 decode error:', err);
    }
  } else {
    loader.load('../multimedia/wd40.glb', (gltf) => {
      modelGroup = setupLoadedModel(gltf);
      scene.add(modelGroup);
    }, undefined, (err) => console.error('GLTFLoader.load error:', err));
  }

  function animate() {
    requestAnimationFrame(animate);
    if (modelGroup) {
      if (autoRotate) {
        rotY += AUTO_SPEED;
      } else if (!isDragging && !lastTouch) {
        rotX += velX; rotY += velY;
        rotX = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, rotX));
        velX *= DAMPING; velY *= DAMPING;
        if (Math.abs(velX) < 0.0002 && Math.abs(velY) < 0.0002) {
          velX = velY = 0; autoRotate = true;
        }
      }
      modelGroup.rotation.x = rotX;
      modelGroup.rotation.y = rotY;
    }
    renderer.render(scene, camera);
  }

  animate();
})();

// ── Galería evento (evento.html) ──
(function () {
  const track = document.getElementById('galleryTrack');
  const dots  = document.querySelectorAll('.gallery-dot');
  const prev  = document.getElementById('galleryPrev');
  const next  = document.getElementById('galleryNext');
  if (!track) return;

  let current = 0;
  const total = track.children.length;

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prev && prev.addEventListener('click', () => goTo(current - 1));
  next && next.addEventListener('click', () => goTo(current + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  let startX = null;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (startX === null) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    startX = null;
  });
})();

// ── CTA secundaria de compra (sponsor.html) ──
(function () {
  const ctaMinus = document.getElementById('ctaQtyMinus');
  const ctaPlus  = document.getElementById('ctaQtyPlus');
  const ctaInput = document.getElementById('ctaQtyInput');
  const ctaBtn   = document.getElementById('ctaAddToCartBtn');
  const MAX_QTY  = 2;
  if (!ctaBtn) return;

  function clampCta(v) { return Math.max(1, Math.min(MAX_QTY, v)); }

  ctaMinus && ctaMinus.addEventListener('click', () => {
    ctaInput.value = clampCta(parseInt(ctaInput.value, 10) - 1);
  });
  ctaPlus && ctaPlus.addEventListener('click', () => {
    ctaInput.value = clampCta(parseInt(ctaInput.value, 10) + 1);
  });
  ctaInput && ctaInput.addEventListener('change', () => {
    ctaInput.value = clampCta(parseInt(ctaInput.value, 10) || 1);
  });

  ctaBtn.addEventListener('click', () => {
    const qty = parseInt(ctaInput.value, 10);
    if (typeof window.addToCart === 'function') {
      window.addToCart(qty);
    } else {
      const heroInput = document.getElementById('qtyInput');
      const heroBtn   = document.getElementById('addToCartBtn');
      if (heroInput && heroBtn) {
        heroInput.value = qty;
        heroBtn.click();
      }
    }
  });
})();
