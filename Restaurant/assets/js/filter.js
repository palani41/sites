/**
 * SMP Restaurant — Filter & Search Manager
 * Dynamic food filtering with live search, pagination
 */
(function ($) {
  'use strict';

  const ITEMS_PER_PAGE = 12;
  let allFoods = [];
  let filtered = [];
  let currentPage = 1;
  let currentCategory = 'all';
  let currentSort = 'popularity';
  let currentPriceRange = 'all';
  let currentSearch = '';
  let currentVeg = 'all';

  const Filter = {
    init() {
      this.loadData();
    },

    async loadData() {
      try {
        // Try to load from JSON file (relative path)
        const basePath = document.location.pathname.includes('/menu.html') ? '' : '';
        const res = await fetch('assets/data/foods.json');
        const data = await res.json();
        allFoods = data.foods;
        filtered = [...allFoods];
        this.bindEvents();
        this.applyFilters();
        this.renderCategories(data.categories);
      } catch (e) {
        console.error('Failed to load foods data:', e);
      }
    },

    renderCategories(categories) {
      const $wrap = $('#category-filter-pills');
      if (!$wrap.length) return;
      let html = `<button class="filter-pill active" data-cat="all">All Items</button>`;
      categories.forEach(cat => {
        html += `<button class="filter-pill" data-cat="${cat.id}">${cat.icon} ${cat.name}</button>`;
      });
      $wrap.html(html);
    },

    bindEvents() {
      // Category filter
      $(document).on('click', '.filter-pill[data-cat]', function () {
        currentCategory = $(this).data('cat');
        currentPage = 1;
        $('.filter-pill[data-cat]').removeClass('active');
        $(this).addClass('active');
        Filter.applyFilters();
        Filter.scrollToGrid();
      });

      // Sort
      $(document).on('change', '#sort-select', function () {
        currentSort = $(this).val();
        currentPage = 1;
        Filter.applyFilters();
      });

      // Price range
      $(document).on('click', '.filter-pill[data-price]', function () {
        currentPriceRange = $(this).data('price');
        currentPage = 1;
        $('.filter-pill[data-price]').removeClass('active');
        $(this).addClass('active');
        Filter.applyFilters();
      });

      // Veg filter
      $(document).on('click', '.filter-pill[data-veg]', function () {
        currentVeg = $(this).data('veg');
        currentPage = 1;
        $('.filter-pill[data-veg]').removeClass('active');
        $(this).addClass('active');
        Filter.applyFilters();
      });

      // Live search
      let searchTimer;
      $(document).on('input', '#food-search', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          currentSearch = $(this).val().toLowerCase().trim();
          currentPage = 1;
          Filter.applyFilters();
        }, 250);
      });

      // Pagination
      $(document).on('click', '.page-btn:not(.disabled)', function () {
        const page = $(this).data('page');
        if (page && page !== currentPage) {
          currentPage = page;
          Filter.renderGrid();
          Filter.renderPagination();
          Filter.scrollToGrid();
        }
      });
    },

    applyFilters() {
      filtered = allFoods.filter(food => {
        // Category
        if (currentCategory !== 'all' && food.category !== currentCategory) return false;
        // Search
        if (currentSearch) {
          const text = `${food.name} ${food.description} ${food.category}`.toLowerCase();
          if (!text.includes(currentSearch)) return false;
        }
        // Price range
        if (currentPriceRange !== 'all') {
          const [min, max] = currentPriceRange.split('-').map(Number);
          if (max ? (food.price < min || food.price > max) : food.price < min) return false;
        }
        // Veg filter
        if (currentVeg === 'veg' && !food.veg) return false;
        if (currentVeg === 'nonveg' && food.veg) return false;
        return true;
      });

      // Sort
      switch (currentSort) {
        case 'popularity': filtered.sort((a, b) => b.popularity - a.popularity); break;
        case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
        case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
        case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
        case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      }

      this.renderGrid();
      this.renderPagination();
      this.updateResultCount();
    },

    renderGrid() {
      const $grid = $('#menu-grid');
      if (!$grid.length) return;

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

      if (pageItems.length === 0) {
        $grid.html(`
          <div class="no-results" style="grid-column:1/-1">
            <div class="no-results-icon">🍽️</div>
            <h4>No items found</h4>
            <p class="text-muted">Try adjusting your filters or search terms</p>
            <button class="btn-gold mt-3" onclick="Filter.reset()">Clear Filters</button>
          </div>
        `);
        return;
      }

      let html = '';
      pageItems.forEach(food => {
        const stars = '★'.repeat(Math.floor(food.rating)) + (food.rating % 1 >= 0.5 ? '½' : '');
        const spicyDots = [1,2,3].map(i => `<span class="spicy-dot ${i <= food.spicy ? 'lit' : 'dim'}"></span>`).join('');
        html += `
          <div class="food-card" data-aos="fade-up">
            <div class="food-card-img">
              <img src="${food.image}" alt="${food.name}" loading="lazy">
              ${food.badge ? `<span class="food-badge">${food.badge}</span>` : ''}
              <span class="veg-dot ${food.veg ? 'veg' : 'non-veg'}">${food.veg ? '●' : '●'}</span>
            </div>
            <div class="food-card-body">
              <div class="food-card-cat">${food.category.replace(/-/g,' ')}</div>
              <div class="food-card-name">${food.name}</div>
              <div class="food-card-desc">${food.description}</div>
              ${food.spicy > 0 ? `<div class="spicy-meter mb-2">${spicyDots}</div>` : ''}
              <div class="food-card-footer">
                <div>
                  <div class="food-price"><small>₹</small>${food.price}</div>
                  <div class="food-rating"><span class="star">${stars}</span><span>${food.rating}</span></div>
                </div>
                <button class="btn-add-cart" onclick='Cart.add(${JSON.stringify(food)})' title="Add to cart">+</button>
              </div>
            </div>
          </div>
        `;
      });

      $grid.html(html);
      // Re-trigger scroll animations
      observeItems();
    },

    renderPagination() {
      const $pag = $('#pagination');
      if (!$pag.length) return;

      const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
      if (totalPages <= 1) { $pag.html(''); return; }

      let html = `<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 1}">‹</button>`;

      for (let i = 1; i <= totalPages; i++) {
        if (totalPages > 8 && i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 2) {
          if (i === 3 || i === totalPages - 2) html += `<span style="align-self:center;color:var(--text-muted)">…</span>`;
          continue;
        }
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }

      html += `<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" data-page="${currentPage + 1}">›</button>`;
      $pag.html(html);
    },

    updateResultCount() {
      const $count = $('#result-count');
      if ($count.length) {
        $count.text(`${filtered.length} item${filtered.length !== 1 ? 's' : ''} found`);
      }
    },

    reset() {
      currentCategory = 'all';
      currentSort = 'popularity';
      currentPriceRange = 'all';
      currentVeg = 'all';
      currentSearch = '';
      currentPage = 1;
      $('#food-search').val('');
      $('.filter-pill').removeClass('active');
      $('.filter-pill[data-cat="all"]').addClass('active');
      this.applyFilters();
    },

    scrollToGrid() {
      const $grid = $('#menu-grid');
      if ($grid.length) {
        $('html, body').animate({ scrollTop: $grid.offset().top - 200 }, 400);
      }
    }
  };

  // Expose globally
  window.Filter = Filter;

  // Init scroll observer for fade animations
  function observeItems() {
    const items = document.querySelectorAll('[data-fade],[data-fade-left],[data-fade-right],.food-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    items.forEach(el => observer.observe(el));
  }

  window.observeItems = observeItems;

  $(document).ready(function () {
    if ($('#menu-grid').length) {
      Filter.init();
    }
    observeItems();
  });

})(jQuery);
