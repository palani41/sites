/* ==========================================================================
   SMP Resort - Custom Script File
   ========================================================================== */

$(document).ready(function () {
  'use strict';

  // ==========================================================================
  // Preloader Spinner Control
  // ==========================================================================
  $(window).on('load', function () {
    var $preloader = $('#preloader');
    if ($preloader.length) {
      $preloader.css({ opacity: 0, visibility: 'hidden' });
    }
  });

  // Safe fallback if window load takes too long
  setTimeout(function () {
    var $preloader = $('#preloader');
    if ($preloader.is(':visible')) {
      $preloader.css({ opacity: 0, visibility: 'hidden' });
    }
  }, 2500);

  // ==========================================================================
  // AOS (Animate On Scroll) Library Initialization
  // ==========================================================================
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      offset: 120
    });
  }

  // ==========================================================================
  // Sticky Navbar & Shrink on Scroll
  // ==========================================================================
  var $navbar = $('#mainNavbar');
  var $backToTop = $('#backToTop');

  function handleScrollEffects() {
    var scrollPos = $(window).scrollTop();
    
    // Navbar Shrink
    if (scrollPos > 50) {
      $navbar.addClass('navbar-scrolled');
    } else {
      $navbar.removeClass('navbar-scrolled');
    }

    // Back To Top Visibility
    if (scrollPos > 600) {
      $backToTop.addClass('show');
    } else {
      $backToTop.removeClass('show');
    }
  }

  // Initial trigger and bind scroll event
  handleScrollEffects();
  $(window).on('scroll', handleScrollEffects);

  // Smooth Back to Top Action
  $backToTop.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 200);
    return false;
  });

  // ==========================================================================
  // Custom ScrollSpy (highlights active link based on scroll position)
  // ==========================================================================
  var $navLinks = $('.navbar-nav .nav-link');
  var $sections = $('section');

  function updateActiveNavLink() {
    var scrollPos = $(window).scrollTop();
    var offset = 95; // Trigger threshold offset in pixels from viewport top

    $sections.each(function () {
      var top = $(this).offset().top - offset;
      var bottom = top + $(this).outerHeight();
      var id = $(this).attr('id');

      if (scrollPos >= top && scrollPos < bottom) {
        if (id) {
          var $matchingLink = $('.navbar-nav').find('[href="#' + id + '"]');
          if ($matchingLink.length) {
            $navLinks.removeClass('active');
            $matchingLink.addClass('active');
          }
        }
      }
    });

    // Special fallback for very top of page (Home)
    if (scrollPos < 100) {
      $navLinks.removeClass('active');
      $('.navbar-nav').find('[href="#home"]').addClass('active');
    }
  }

  // Bind scroll spy
  $(window).on('scroll', updateActiveNavLink);
  updateActiveNavLink();

  // ==========================================================================
  // Smooth Scroll for Navigation and Anchors
  // ==========================================================================
  $('a[href^="#"]:not([href="#"])').on('click', function (event) {
    var target = $(this.getAttribute('href'));
    if (target.length) {
      event.preventDefault();
      
      // Update active nav-link highlighting immediately
      if ($(this).hasClass('nav-link')) {
        $('.navbar-nav .nav-link').removeClass('active');
        $(this).addClass('active');
      }

      // Close mobile navbar menu if open
      var $navbarCollapse = $('.navbar-collapse');
      if ($navbarCollapse.hasClass('show')) {
        $('.navbar-toggler').click();
      }

      var offset = 80; // Offset matching navbar height
      $('html, body').stop().animate({
        scrollTop: target.offset().top - offset
      }, 100);
    }
  });

  // ==========================================================================
  // Statistics Counter Animation (IntersectionObserver)
  // ==========================================================================
  var countElements = document.querySelectorAll('.stat-number');
  
  if (countElements.length && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target); // Trigger animation only once
        }
      });
    }, { threshold: 0.5 });

    countElements.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    // Fallback if IntersectionObserver is not supported
    $('.stat-number').each(function () {
      animateCounter(this);
    });
  }

  function animateCounter(el) {
    var $el = $(el);
    var targetNum = parseInt($el.attr('data-target'), 10) || 0;
    var duration = 2000; // 2 seconds
    var startNum = 0;
    var steps = 50;
    var delay = duration / steps;
    var increment = targetNum / steps;
    var currentStep = 0;

    var timer = setInterval(function () {
      currentStep++;
      var currentVal = Math.ceil(increment * currentStep);
      
      if (currentVal >= targetNum) {
        $el.text(targetNum);
        clearInterval(timer);
      } else {
        $el.text(currentVal);
      }
    }, delay);
  }

  // ==========================================================================
  // Gallery Masonry Custom Lightbox Popup
  // ==========================================================================
  var galleryItems = $('.gallery-item');
  var $lightbox = $('#customLightbox');
  var $lightboxImg = $('#lightboxImg');
  var $lightboxCaption = $('#lightboxCaption');
  var $lightboxSubcaption = $('#lightboxSubcaption');
  var currentGalleryIndex = 0;

  // Click on gallery item to open Lightbox
  galleryItems.on('click', function () {
    currentGalleryIndex = galleryItems.index(this);
    updateLightboxContent();
    $lightbox.addClass('show');
  });

  function updateLightboxContent() {
    var $currentItem = galleryItems.eq(currentGalleryIndex);
    var imgSrc = $currentItem.attr('data-src');
    var imgTitle = $currentItem.attr('data-title');
    var imgDesc = $currentItem.attr('data-desc');

    $lightboxImg.attr('src', imgSrc);
    $lightboxCaption.text(imgTitle);
    $lightboxSubcaption.text(imgDesc);
  }

  // Navigation: Next
  $('#lightboxNext').on('click', function (e) {
    e.stopPropagation();
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryItems.length;
    updateLightboxContent();
  });

  // Navigation: Prev
  $('#lightboxPrev').on('click', function (e) {
    e.stopPropagation();
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightboxContent();
  });

  // Close Lightbox
  function closeLightbox() {
    $lightbox.removeClass('show');
  }

  $('#lightboxClose').on('click', closeLightbox);

  // Close when clicking overlay (outside the image content wrapper)
  $lightbox.on('click', function (e) {
    if ($(e.target).closest('.lightbox-content-wrapper').length === 0 && 
        $(e.target).closest('.lightbox-nav-btn').length === 0) {
      closeLightbox();
    }
  });

  // Keyboard accessibility for Lightbox
  $(document).on('keydown', function (e) {
    if ($lightbox.hasClass('show')) {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        $('#lightboxNext').click();
      } else if (e.key === 'ArrowLeft') {
        $('#lightboxPrev').click();
      }
    }
  });

  // ==========================================================================
  // Booking Selection Prepopulation from Room Cards
  // ==========================================================================
  $('.room-book-btn').on('click', function () {
    var roomName = $(this).attr('data-room-name');
    var $roomSelect = $('#bookingRoomType');

    if ($roomSelect.length && roomName) {
      $roomSelect.val(roomName);
    }
  });

  // ==========================================================================
  // Booking Form & Date Range Logic
  // ==========================================================================
  var checkInInput = document.getElementById('bookingCheckIn');
  var checkOutInput = document.getElementById('bookingCheckOut');

  if (checkInInput && checkOutInput) {
    // Set check-in min date to today
    var todayStr = new Date().toISOString().split('T')[0];
    checkInInput.min = todayStr;

    // Synchronize check-out min date with check-in selection
    $(checkInInput).on('change', function () {
      var selectedCheckIn = this.value;
      if (selectedCheckIn) {
        // Set checkout min date to at least 1 day after check-in
        var checkInDate = new Date(selectedCheckIn);
        checkInDate.setDate(checkInDate.getDate() + 1);
        var minCheckOutStr = checkInDate.toISOString().split('T')[0];
        
        checkOutInput.min = minCheckOutStr;

        // If checkout date is before new check-in limit, reset it
        if (checkOutInput.value && checkOutInput.value < minCheckOutStr) {
          checkOutInput.value = minCheckOutStr;
        }
      }
    });
  }

  // Booking Form Validation
  $('#bookingForm').on('submit', function (event) {
    event.preventDefault();
    var form = this;
    var isValid = true;

    // Reset error classes
    $(form).find('.form-control, .form-select').removeClass('is-invalid');

    // Validation fields
    var name = $('#bookingName').val().trim();
    var email = $('#bookingEmail').val().trim();
    var phone = $('#bookingPhone').val().trim();
    var roomType = $('#bookingRoomType').val();
    var checkIn = $('#bookingCheckIn').val();
    var checkOut = $('#bookingCheckOut').val();
    var guests = $('#bookingGuests').val();

    // Regex checking
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) {
      $('#bookingName').addClass('is-invalid');
      isValid = false;
    }
    if (!email || !emailRegex.test(email)) {
      $('#bookingEmail').addClass('is-invalid');
      isValid = false;
    }
    if (!phone) {
      $('#bookingPhone').addClass('is-invalid');
      isValid = false;
    }
    if (!roomType) {
      $('#bookingRoomType').addClass('is-invalid');
      isValid = false;
    }
    if (!checkIn) {
      $('#bookingCheckIn').addClass('is-invalid');
      isValid = false;
    }
    if (!checkOut) {
      $('#bookingCheckOut').addClass('is-invalid');
      isValid = false;
    }
    if (!guests) {
      $('#bookingGuests').addClass('is-invalid');
      isValid = false;
    }

    if (isValid) {
      // Hide form contents, display success message
      $('#bookingForm').slideUp(300);
      $('#bookingSuccessAlert').fadeIn(500);

      // Reset form after successful submission
      form.reset();
    }
  });

  // Allow booking success alert dismiss / restart form
  $('#bookingSuccessAlert').on('click', function () {
    $(this).fadeOut(300, function () {
      $('#bookingForm').slideDown(300);
    });
  });

  // ==========================================================================
  // Contact Form Validation
  // ==========================================================================
  $('#contactForm').on('submit', function (event) {
    event.preventDefault();
    var form = this;
    var isValid = true;

    $(form).find('.form-control').removeClass('is-invalid');
    $('#contactSuccessAlert').hide();

    var name = $('#contactName').val().trim();
    var email = $('#contactEmail').val().trim();
    var subject = $('#contactSubject').val().trim();
    var message = $('#contactMessage').val().trim();

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) {
      $('#contactName').addClass('is-invalid');
      isValid = false;
    }
    if (!email || !emailRegex.test(email)) {
      $('#contactEmail').addClass('is-invalid');
      isValid = false;
    }
    if (!subject) {
      $('#contactSubject').addClass('is-invalid');
      isValid = false;
    }
    if (!message) {
      $('#contactMessage').addClass('is-invalid');
      isValid = false;
    }

    if (isValid) {
      $('#contactSuccessAlert').fadeIn(400);
      form.reset();
      
      // Auto-hide alert after 5 seconds
      setTimeout(function () {
        $('#contactSuccessAlert').fadeOut(400);
      }, 5000);
    }
  });
});
