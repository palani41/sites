/**
 * SMP Restaurant — Cart Manager
 * Full cart functionality with localStorage persistence
 */
(function ($) {
  'use strict';

  const Cart = {
    items: [],

    init() {
      this.load();
      this.bindEvents();
      this.render();
      this.updateCount();
    },

    load() {
      try {
        const saved = localStorage.getItem('smp_cart');
        this.items = saved ? JSON.parse(saved) : [];
      } catch (e) {
        this.items = [];
      }
    },

    save() {
      localStorage.setItem('smp_cart', JSON.stringify(this.items));
    },

    add(item) {
      const existing = this.items.find(i => i.id === item.id);
      if (existing) {
        existing.qty += 1;
        showToast(`${item.name} quantity updated ✓`);
      } else {
        this.items.push({ ...item, qty: 1 });
        showToast(`${item.name} added to cart ✓`);
      }
      this.save();
      this.render();
      this.updateCount();
      this.openSidebar();
    },

    remove(id) {
      this.items = this.items.filter(i => i.id !== id);
      this.save();
      this.render();
      this.updateCount();
    },

    updateQty(id, delta) {
      const item = this.items.find(i => i.id === id);
      if (!item) return;
      item.qty = Math.max(0, item.qty + delta);
      if (item.qty === 0) this.remove(id);
      else {
        this.save();
        this.render();
      }
      this.updateCount();
    },

    clear() {
      this.items = [];
      this.save();
      this.render();
      this.updateCount();
    },

    total() {
      return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    },

    count() {
      return this.items.reduce((sum, i) => sum + i.qty, 0);
    },

    render() {
      const $container = $('#cart-items');
      if (!$container.length) return;

      if (this.items.length === 0) {
        $container.html(`
          <div class="cart-empty">
            <div class="cart-empty-icon">🛒</div>
            <h5>Your cart is empty</h5>
            <p class="text-muted" style="font-size:0.9rem">Add some delicious items to get started!</p>
          </div>
        `);
        $('#cart-total').text('₹0');
        $('#checkout-btn').prop('disabled', true).text('Nothing to checkout');
        return;
      }

      let html = '';
      this.items.forEach(item => {
        html += `
          <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img" loading="lazy">
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString()}</div>
              <div class="cart-qty">
                <button class="cart-qty-btn" onclick="Cart.updateQty(${item.id}, -1)">−</button>
                <span class="cart-qty-num">${item.qty}</span>
                <button class="cart-qty-btn" onclick="Cart.updateQty(${item.id}, 1)">+</button>
              </div>
            </div>
            <button class="cart-remove" onclick="Cart.remove(${item.id})" title="Remove">✕</button>
          </div>
        `;
      });

      $container.html(html);
      $('#cart-total').text('₹' + this.total().toLocaleString());
      $('#checkout-btn').prop('disabled', false).text(`Checkout — ₹${this.total().toLocaleString()}`);
    },

    updateCount() {
      const count = this.count();
      const $badge = $('#cart-count');
      $badge.text(count);
      if (count > 0) $badge.addClass('show');
      else $badge.removeClass('show');
    },

    openSidebar() {
      $('#cart-sidebar').addClass('open');
      $('#cart-overlay').addClass('show');
      $('body').css('overflow', 'hidden');
    },

    closeSidebar() {
      $('#cart-sidebar').removeClass('open');
      $('#cart-overlay').removeClass('show');
      $('body').css('overflow', '');
    },

    bindEvents() {
      $(document).on('click', '#cart-toggle, .cart-btn-wrap', () => this.openSidebar());
      $(document).on('click', '#cart-close, #cart-overlay', () => this.closeSidebar());
      $(document).on('click', '#clear-cart', () => {
        if (confirm('Clear all items from cart?')) this.clear();
      });
      $(document).on('click', '#checkout-btn', () => {
        if (this.items.length === 0) return;
        showToast('🎉 Order placed! We\'ll prepare your food shortly.');
        setTimeout(() => this.clear(), 1500);
        this.closeSidebar();
      });
      // Close on Escape
      $(document).on('keydown', (e) => {
        if (e.key === 'Escape') this.closeSidebar();
      });
    }
  };

  // Expose globally
  window.Cart = Cart;

  // Toast utility
  window.showToast = function (msg) {
    const $t = $('#toast-smp');
    $t.find('.toast-msg').text(msg);
    $t.addClass('show');
    setTimeout(() => $t.removeClass('show'), 3000);
  };

  // Init on DOM ready
  $(document).ready(function () {
    Cart.init();
  });

})(jQuery);
