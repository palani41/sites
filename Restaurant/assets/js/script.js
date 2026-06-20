/**
 * SMP Restaurant — Main Script
 * UI interactions, dark mode, loading, stats counter, gallery, timer
 */
(function ($) {
  'use strict';

  /* ---- Loading Screen ---- */
  function initLoader() {
    const $loader = $('#loading-screen');
    if (!$loader.length) return;
    setTimeout(() => {
      $loader.addClass('fade-out');
      setTimeout(() => $loader.hide(), 600);
    }, 2200);
  }

  /* ---- Sticky Navbar ---- */
  function initNavbar() {
    $(window).on('scroll.navbar', function () {
      if ($(this).scrollTop() > 60) {
        $('#mainNav').addClass('scrolled');
      } else {
        $('#mainNav').removeClass('scrolled');
      }
    });
    // Active link
    const path = window.location.pathname.split('/').pop() || 'index.html';
    $('.nav-link').each(function () {
      const href = $(this).attr('href');
      if (href === path || (path === '' && href === 'index.html')) {
        $(this).addClass('active');
      }
    });
  }

  /* ---- Dark Mode ---- */
  function initDarkMode() {
    const saved = localStorage.getItem('smp_theme') || 'light';
    if (saved === 'dark') {
      $('html').attr('data-theme', 'dark');
      $('.dark-toggle').text('☀ Light');
    }
    $(document).on('click', '.dark-toggle', function () {
      const isDark = $('html').attr('data-theme') === 'dark';
      if (isDark) {
        $('html').removeAttr('data-theme');
        localStorage.setItem('smp_theme', 'light');
        $(this).text('☾ Dark');
      } else {
        $('html').attr('data-theme', 'dark');
        localStorage.setItem('smp_theme', 'dark');
        $(this).text('☀ Light');
      }
    });
    // Apply saved toggle text
    const $toggle = $('.dark-toggle');
    $toggle.text(saved === 'dark' ? '☀ Light' : '☾ Dark');
  }

  /* ---- Back to Top ---- */
  function initBackToTop() {
    $(window).on('scroll.btt', function () {
      if ($(this).scrollTop() > 400) {
        $('#back-to-top').addClass('visible');
      } else {
        $('#back-to-top').removeClass('visible');
      }
    });
    $('#back-to-top').on('click', function () {
      $('html, body').animate({ scrollTop: 0 }, 600, 'swing');
    });
  }

  /* ---- Scroll Animations ---- */
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('[data-fade],[data-fade-left],[data-fade-right]').forEach(el => {
      observer.observe(el);
    });
  }

  /* ---- Counter Animation ---- */
  function animateCounter($el) {
    const target = parseFloat($el.data('target'));
    const suffix = $el.data('suffix') || '';
    const prefix = $el.data('prefix') || '';
    const isFloat = target !== Math.floor(target);
    const duration = 2000;
    const start = Date.now();

    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;
      $el.text(prefix + (isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString()) + suffix);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function initCounters() {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !$(entry.target).data('counted')) {
          $(entry.target).data('counted', true);
          animateCounter($(entry.target));
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-counter]').forEach(el => {
      counterObserver.observe(el);
    });
  }

  /* ---- Countdown Timer ---- */
  function initCountdown() {
    const $timer = $('#countdown');
    if (!$timer.length) return;

    function update() {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 0);
      const diff = end - now;

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      $('#timer-h').text(String(h).padStart(2, '0'));
      $('#timer-m').text(String(m).padStart(2, '0'));
      $('#timer-s').text(String(s).padStart(2, '0'));
    }

    update();
    setInterval(update, 1000);
  }

  /* ---- Gallery Lightbox ---- */
  function initGallery() {
    $(document).on('click', '.gallery-item', function () {
      const src = $(this).find('img').attr('src');
      const caption = $(this).find('.gallery-caption').text();
      $('#lightbox-img').attr('src', src);
      $('#lightbox-caption').text(caption);
      $('#lightbox').addClass('show');
      $('body').css('overflow', 'hidden');
    });

    $(document).on('click', '#lightbox, #lightbox-close', function (e) {
      if (e.target === this || $(e.target).is('#lightbox-close')) {
        $('#lightbox').removeClass('show');
        $('body').css('overflow', '');
      }
    });

    // Gallery tabs
    $(document).on('click', '.gallery-tab-btn', function () {
      const cat = $(this).data('cat');
      $('.gallery-tab-btn').removeClass('active');
      $(this).addClass('active');
      if (cat === 'all') {
        $('.gallery-item').show();
      } else {
        $('.gallery-item').each(function () {
          if ($(this).data('cat') === cat) $(this).show();
          else $(this).hide();
        });
      }
    });
  }

  /* ---- Newsletter Form ---- */
  function initNewsletter() {
    $(document).on('submit', '#newsletter-form', function (e) {
      e.preventDefault();
      const email = $(this).find('input').val().trim();
      if (!email) return;
      showToast('🎉 Subscribed! Welcome to SMP Food family.');
      $(this).find('input').val('');
    });
  }

  /* ---- Contact Form ---- */
  function initContactForm() {
    $(document).on('submit', '#contact-form', function (e) {
      e.preventDefault();
      const $btn = $(this).find('[type=submit]');
      $btn.text('Sending…').prop('disabled', true);
      setTimeout(() => {
        showToast('✉️ Message sent! We\'ll reply within 24 hours.');
        $(this)[0].reset();
        $btn.text('Send Message').prop('disabled', false);
      }, 1500);
    });
  }

  /* ---- Smooth Scroll ---- */
  function initSmoothScroll() {
    $(document).on('click', 'a[href^="#"]', function (e) {
      const target = $($(this).attr('href'));
      if (target.length) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: target.offset().top - 80 }, 600);
      }
    });
  }

  /* ---- Strip duplicate scroll handler ---- */
  function initWelcomeStrip() {
    const $strip = $('.strip-track');
    if ($strip.length) {
      // Clone for seamless loop
      $strip.append($strip.html());
    }
  }

  /* ---- Bootstrap carousel auto ---- */
  function initCarousel() {
    $('.carousel').carousel({ interval: 4000, ride: 'carousel' });
  }

  /* ---- Image lazy loading enhancement ---- */
  function initLazyLoad() {
    if ('loading' in HTMLImageElement.prototype) return; // Native support
    const imgs = document.querySelectorAll('img[loading="lazy"]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          if (img.dataset.src) img.src = img.dataset.src;
          io.unobserve(img);
        }
      });
    });
    imgs.forEach(img => io.observe(img));
  }

  /* ---- Featured foods from JSON on home page ---- */
  async function initFeaturedFoods() {
    const $wrap = $('#featured-foods-grid');
    if (!$wrap.length) return;

    try {
      const res = await fetch('assets/data/foods.json');
      const data = await res.json();
      const featured = data.foods.filter(f => f.badge).slice(0, 6);

      let html = '';
      featured.forEach(food => {
        html += `
          <div class="col-lg-4 col-md-6" data-fade>
            <div class="food-card">
              <div class="food-card-img">
                <img src="${food.image}" alt="${food.name}" loading="lazy">
                ${food.badge ? `<span class="food-badge">${food.badge}</span>` : ''}
                <span class="veg-dot ${food.veg ? 'veg' : 'non-veg'}">${food.veg ? '●' : '●'}</span>
              </div>
              <div class="food-card-body">
                <div class="food-card-cat">${food.category.replace(/-/g,' ')}</div>
                <div class="food-card-name">${food.name}</div>
                <div class="food-card-desc">${food.description}</div>
                <div class="food-card-footer">
                  <div>
                    <div class="food-price"><small>₹</small>${food.price}</div>
                    <div class="food-rating"><span class="star">★</span><span>${food.rating}</span></div>
                  </div>
                  <button class="btn-add-cart" onclick='Cart.add(${JSON.stringify(food)})'>+</button>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      $wrap.html(html);
      initScrollAnimations();
    } catch (e) {
      console.error('Featured foods load error:', e);
    }
  }

  /* ---- Init ---- */
  $(document).ready(function () {
    initLoader();
    initNavbar();
    initDarkMode();
    initBackToTop();
    initScrollAnimations();
    initCounters();
    initCountdown();
    initGallery();
    initNewsletter();
    initContactForm();
    initSmoothScroll();
    initWelcomeStrip();
    initCarousel();
    initLazyLoad();
    initFeaturedFoods();
  });

})(jQuery);
