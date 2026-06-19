// ── Carrito de compras (WD-40 Skater Edition) ──
// Carrito en memoria: se reinicia al recargar la página.
(function () {

  const PRODUCT = {
    id: 'wd40-skater-edition',
    name: 'WD-40 Skater Edition',
    price: 8500,
    image: '../multimedia/wd40.glb'
  };

  let cart = []; // [{ id, name, price, qty }]

  // ── Helpers ──
  function formatPrice(value) {
    return '$ ' + value.toLocaleString('es-AR');
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  // ── Referencias DOM ──
  const qtyInput     = document.getElementById('qtyInput');
  const qtyMinusBtn  = document.getElementById('qtyMinus');
  const qtyPlusBtn   = document.getElementById('qtyPlus');
  const addToCartBtn = document.getElementById('addToCartBtn');

  const cartCountEl   = document.getElementById('cartCount');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartEmptyEl   = document.getElementById('cartEmpty');
  const cartTotalEl   = document.getElementById('cartTotal');
  const clearCartBtn  = document.getElementById('clearCartBtn');
  const checkoutBtn   = document.getElementById('checkoutBtn');
  const cartToast     = document.getElementById('cartToast');

  // Si no estamos en la página con tienda, no hacemos nada.
  if (!addToCartBtn) return;

  // ── Stepper de cantidad ──
  function clampQty(value) {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 1) return 1;
    if (n > 20) return 20;
    return n;
  }

  qtyMinusBtn.addEventListener('click', () => {
    qtyInput.value = clampQty(parseInt(qtyInput.value, 10) - 1);
  });

  qtyPlusBtn.addEventListener('click', () => {
    qtyInput.value = clampQty(parseInt(qtyInput.value, 10) + 1);
  });

  qtyInput.addEventListener('change', () => {
    qtyInput.value = clampQty(qtyInput.value);
  });

  // ── Agregar al carrito ──
  addToCartBtn.addEventListener('click', () => {
    const qty = clampQty(qtyInput.value);
    const existing = cart.find(item => item.id === PRODUCT.id);

    if (existing) {
      existing.qty = Math.min(existing.qty + qty, 99);
    } else {
      cart.push({ id: PRODUCT.id, name: PRODUCT.name, price: PRODUCT.price, qty });
    }

    renderCart();
    showToast(`Agregaste ${qty} x ${PRODUCT.name} al carrito.`);
    qtyInput.value = 1;
  });

  // ── Render del carrito ──
  function renderCart() {
    cartItemsList.innerHTML = '';

    if (cart.length === 0) {
      cartEmptyEl.hidden = false;
      cartItemsList.hidden = true;
    } else {
      cartEmptyEl.hidden = true;
      cartItemsList.hidden = false;

      cart.forEach(item => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-unit-price">${formatPrice(item.price)} c/u</span>
          </div>
          <div class="cart-item-controls">
            <div class="qty-stepper qty-stepper-sm" role="group" aria-label="Cantidad de ${item.name}">
              <button type="button" class="qty-btn cart-item-minus" data-id="${item.id}" aria-label="Restar">−</button>
              <span class="qty-display">${item.qty}</span>
              <button type="button" class="qty-btn cart-item-plus" data-id="${item.id}" aria-label="Sumar">+</button>
            </div>
            <span class="cart-item-subtotal">${formatPrice(item.price * item.qty)}</span>
            <button type="button" class="cart-item-remove" data-id="${item.id}" aria-label="Quitar ${item.name}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
              </svg>
            </button>
          </div>
        `;
        cartItemsList.appendChild(li);
      });
    }

    cartTotalEl.textContent = formatPrice(getCartTotal());

    const count = getCartCount();
    if (count > 0) {
      cartCountEl.hidden = false;
      cartCountEl.textContent = count;
    } else {
      cartCountEl.hidden = true;
    }

    checkoutBtn.disabled = cart.length === 0;
    clearCartBtn.disabled = cart.length === 0;
  }

  // ── Eventos delegados dentro del carrito (sumar / restar / quitar) ──
  cartItemsList.addEventListener('click', (e) => {
    const minusBtn  = e.target.closest('.cart-item-minus');
    const plusBtn   = e.target.closest('.cart-item-plus');
    const removeBtn = e.target.closest('.cart-item-remove');

    if (minusBtn) {
      const item = cart.find(i => i.id === minusBtn.dataset.id);
      if (item) {
        item.qty -= 1;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== item.id);
        renderCart();
      }
    }

    if (plusBtn) {
      const item = cart.find(i => i.id === plusBtn.dataset.id);
      if (item) {
        item.qty = Math.min(item.qty + 1, 99);
        renderCart();
      }
    }

    if (removeBtn) {
      cart = cart.filter(i => i.id !== removeBtn.dataset.id);
      renderCart();
    }
  });

  // ── Vaciar carrito ──
  clearCartBtn.addEventListener('click', () => {
    cart = [];
    renderCart();
  });

  // ── Comprar (checkout simulado) ──
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;

    const total = getCartTotal();
    const count = getCartCount();

    cartItemsList.innerHTML = `
      <li class="cart-success">
        <p class="cart-success-title">¡Compra confirmada!</p>
        <p class="cart-success-msg">Compraste ${count} producto${count > 1 ? 's' : ''} por un total de ${formatPrice(total)}. Te enviamos la confirmación por correo.</p>
      </li>
    `;
    cartEmptyEl.hidden = true;
    cartItemsList.hidden = false;

    cart = [];
    cartTotalEl.textContent = formatPrice(0);
    cartCountEl.hidden = true;
    checkoutBtn.disabled = true;
    clearCartBtn.disabled = true;

    showToast('¡Gracias por tu compra!');
  });

  // ── Toast simple de confirmación ──
  let toastTimeout = null;
  function showToast(message) {
    if (!cartToast) return;
    cartToast.textContent = message;
    cartToast.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      cartToast.classList.remove('visible');
    }, 2600);
  }

  // ── Estado inicial ──
  renderCart();

})();
