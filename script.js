(function() {
  'use strict';

  if (typeof window.__app === 'undefined') {
    window.__app = {};
  }

  var bus = window.__app;

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var context = this, args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (bus.burgerInited) return;
    bus.burgerInited = true;

    var nav = document.querySelector('.c-nav#main-nav');
    var toggle = document.querySelector('.c-nav__toggle');
    var body = document.body;

    if (!nav || !toggle) return;

    var isOpen = false;

    function openMenu() {
      isOpen = true;
      nav.classList.add('is-open');
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
    }

    function closeMenu() {
      isOpen = false;
      nav.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    }

    function toggleMenu() {
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleMenu();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener('click', function(e) {
      if (!isOpen) return;
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    var navLinks = document.querySelectorAll('.c-nav__link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        if (window.innerWidth < 1024) {
          closeMenu();
        }
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && isOpen) {
        closeMenu();
      }
    }, 200);

    window.addEventListener('resize', resizeHandler, { passive: true });
  }

  function initSmoothScroll() {
    if (bus.scrollInited) return;
    bus.scrollInited = true;

    function getHeaderHeight() {
      var header = document.querySelector('.l-header');
      return header ? header.offsetHeight : 80;
    }

    function smoothScrollTo(target) {
      var offset = getHeaderHeight();
      var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }

    document.addEventListener('click', function(e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var href = link.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      var targetId = href.substring(1);
      var targetEl = document.getElementById(targetId);

      if (targetEl) {
        e.preventDefault();
        smoothScrollTo(targetEl);
        history.pushState(null, '', href);
      }
    });

    if (window.location.hash && window.location.hash.length > 1) {
      setTimeout(function() {
        var targetId = window.location.hash.substring(1);
        var targetEl = document.getElementById(targetId);
        if (targetEl) {
          smoothScrollTo(targetEl);
        }
      }, 300);
    }
  }

  function initScrollSpy() {
    if (bus.scrollSpyInited) return;
    bus.scrollSpyInited = true;

    var navLinks = document.querySelectorAll('.c-nav__link[href^="#"]');
    if (navLinks.length === 0) return;

    var sections = [];
    for (var i = 0; i < navLinks.length; i++) {
      var href = navLinks[i].getAttribute('href');
      if (href && href !== '#' && href !== '#!') {
        var section = document.querySelector(href);
        if (section) {
          sections.push({ link: navLinks[i], section: section });
        }
      }
    }

    if (sections.length === 0) return;

    function updateActiveLink() {
      var scrollPos = window.pageYOffset + 100;

      for (var i = sections.length - 1; i >= 0; i--) {
        var item = sections[i];
        if (item.section.offsetTop <= scrollPos) {
          for (var j = 0; j < navLinks.length; j++) {
            navLinks[j].classList.remove('is-active', 'active');
            navLinks[j].removeAttribute('aria-current');
          }
          item.link.classList.add('is-active', 'active');
          item.link.setAttribute('aria-current', 'page');
          return;
        }
      }
    }

    var scrollHandler = throttle(updateActiveLink, 100);
    window.addEventListener('scroll', scrollHandler, { passive: true });
  }

  function initScrollAnimations() {
    if (bus.scrollAnimInited) return;
    bus.scrollAnimInited = true;

    var elements = document.querySelectorAll('.c-card, .c-stat, .l-section__header, .c-timeline__item, .c-membership');

    if (elements.length === 0) return;

    for (var i = 0; i < elements.length; i++) {
      elements[i].style.opacity = '0';
      elements[i].style.transform = 'translateY(30px)';
      elements[i].style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    for (var j = 0; j < elements.length; j++) {
      observer.observe(elements[j]);
    }
  }

  function initImageAnimations() {
    if (bus.imageAnimInited) return;
    bus.imageAnimInited = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      var isCritical = img.hasAttribute('data-critical') || img.classList.contains('c-logo__img');
      if (!img.hasAttribute('loading') && !isCritical) {
        img.setAttribute('loading', 'lazy');
      }

      if (!isCritical) {
        img.style.opacity = '0';
        img.style.transform = 'scale(0.95)';
        img.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      }

      img.addEventListener('load', function() {
        this.style.opacity = '1';
        this.style.transform = 'scale(1)';
      });

      img.addEventListener('error', function(e) {
        var target = e.target;
        var placeholderSVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e9ecef" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236c757d" font-family="sans-serif" font-size="18"%3EBild nicht verfügbar%3C/text%3E%3C/svg%3E';
        target.src = placeholderSVG;
        target.style.objectFit = 'contain';
      });
    }
  }

  function initButtonRipple() {
    if (bus.rippleInited) return;
    bus.rippleInited = true;

    var buttons = document.querySelectorAll('.c-button, button[class*="c-button"]');

    for (var i = 0; i < buttons.length; i++) {
      (function(button) {
        button.addEventListener('click', function(e) {
          var ripple = document.createElement('span');
          ripple.style.position = 'absolute';
          ripple.style.borderRadius = '50%';
          ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
          ripple.style.width = '20px';
          ripple.style.height = '20px';
          ripple.style.pointerEvents = 'none';
          ripple.style.animation = 'ripple-effect 0.6s ease-out';

          var rect = button.getBoundingClientRect();
          var x = e.clientX - rect.left;
          var y = e.clientY - rect.top;

          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';
          ripple.style.transform = 'translate(-50%, -50%)';

          button.appendChild(ripple);

          setTimeout(function() {
            if (ripple.parentNode) {
              ripple.parentNode.removeChild(ripple);
            }
          }, 600);
        });
      })(buttons[i]);
    }

    var style = document.createElement('style');
    style.textContent = '@keyframes ripple-effect { to { width: 200px; height: 200px; opacity: 0; } }';
    document.head.appendChild(style);
  }

  function initCountUp() {
    if (bus.countUpInited) return;
    bus.countUpInited = true;

    var stats = document.querySelectorAll('.c-stat__value');
    if (stats.length === 0) return;

    function animateValue(element, start, end, duration) {
      var range = end - start;
      var increment = range / (duration / 16);
      var current = start;
      var timer = setInterval(function() {
        current += increment;
        if (current >= end) {
          current = end;
          clearInterval(timer);
        }
        element.textContent = Math.floor(current) + (element.dataset.suffix || '');
      }, 16);
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var element = entry.target;
          var text = element.textContent.trim();
          var match = text.match(/[d,.]+/);
          if (match) {
            var endValue = parseFloat(match[0].replace(/,/g, ''));
            var suffix = text.replace(/[d,.]+/, '').trim();
            element.dataset.suffix = suffix;
            element.textContent = '0' + suffix;
            animateValue(element, 0, endValue, 2000);
            observer.unobserve(element);
          }
        }
      });
    }, { threshold: 0.5 });

    for (var i = 0; i < stats.length; i++) {
      observer.observe(stats[i]);
    }
  }

  function initFormValidation() {
    if (bus.formValidationInited) return;
    bus.formValidationInited = true;

    var forms = document.querySelectorAll('form.c-form');

    var patterns = {
      name: /^[a-zA-ZÀ-ÿs-']{2,50}$/,
      email: /^[^s@]+@[^s@]+.[^s@]+$/,
      phone: /^[+-ds()]{10,20}$/,
      message: /^.{10,}$/
    };

    var messages = {
      name: 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen, nur Buchstaben).',
      email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      phone: 'Bitte geben Sie eine gültige Telefonnummer ein (10-20 Zeichen).',
      message: 'Bitte geben Sie eine Nachricht mit mindestens 10 Zeichen ein.',
      privacy: 'Bitte akzeptieren Sie die Datenschutzbestimmungen.',
      required: 'Dieses Feld ist erforderlich.'
    };

    function showError(input, message) {
      var errorEl = input.parentNode.querySelector('.c-form__error');
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'c-form__error';
        input.parentNode.appendChild(errorEl);
      }
      errorEl.textContent = message;
      input.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');
    }

    function clearError(input) {
      var errorEl = input.parentNode.querySelector('.c-form__error');
      if (errorEl) {
        errorEl.textContent = '';
      }
      input.classList.remove('has-error');
      input.removeAttribute('aria-invalid');
    }

    function validateField(input) {
      var value = input.value.trim();
      var type = input.id.replace(/^(contact|demo)-/, '');

      clearError(input);

      if (input.hasAttribute('required') && !value) {
        showError(input, messages.required);
        return false;
      }

      if (input.type === 'checkbox') {
        if (input.hasAttribute('required') && !input.checked) {
          showError(input, messages.privacy);
          return false;
        }
        return true;
      }

      if (value && patterns[type]) {
        if (!patterns[type].test(value)) {
          showError(input, messages[type]);
          return false;
        }
      }

      return true;
    }

    for (var i = 0; i < forms.length; i++) {
      (function(form) {
        var inputs = form.querySelectorAll('input, textarea, select');

        for (var j = 0; j < inputs.length; j++) {
          (function(input) {
            input.addEventListener('blur', function() {
              validateField(input);
            });

            input.addEventListener('input', function() {
              if (input.classList.contains('has-error')) {
                validateField(input);
              }
            });
          })(inputs[j]);
        }

        form.addEventListener('submit', function(e) {
          e.preventDefault();
          e.stopPropagation();

          var isValid = true;

          for (var k = 0; k < inputs.length; k++) {
            if (!validateField(inputs[k])) {
              isValid = false;
            }
          }

          if (!isValid) {
            var firstError = form.querySelector('.has-error');
            if (firstError) {
              firstError.focus();
              firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
          }

          var submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = true;
            var originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;"></span>Wird gesendet...';

            var style = document.createElement('style');
            style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
            if (!document.querySelector('style[data-spin]')) {
              style.setAttribute('data-spin', '');
              document.head.appendChild(style);
            }

            setTimeout(function() {
              window.location.href = 'thank_you.html';
            }, 1000);
          }
        });
      })(forms[i]);
    }
  }

  function initScrollToTop() {
    if (bus.scrollTopInited) return;
    bus.scrollTopInited = true;

    var button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'c-scroll-top';
    button.setAttribute('aria-label', 'Nach oben scrollen');
    button.style.cssText = 'position:fixed;bottom:30px;right:30px;width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,var(--color-primary),var(--color-primary-dark));color:white;border:none;font-size:24px;cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s ease-out;z-index:1000;box-shadow:var(--shadow-lg);';

    document.body.appendChild(button);

    var scrollHandler = throttle(function() {
      if (window.pageYOffset > 300) {
        button.style.opacity = '1';
        button.style.visibility = 'visible';
      } else {
        button.style.opacity = '0';
        button.style.visibility = 'hidden';
      }
    }, 100);

    window.addEventListener('scroll', scrollHandler, { passive: true });

    button.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
    });

    button.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  }

  function initLanguageSwitcher() {
    if (bus.langInited) return;
    bus.langInited = true;

    var buttons = document.querySelectorAll('.c-language-switcher__btn');

    for (var i = 0; i < buttons.length; i++) {
      (function(button) {
        button.addEventListener('click', function() {
          for (var j = 0; j < buttons.length; j++) {
            buttons[j].classList.remove('is-active');
          }
          this.classList.add('is-active');
        });
      })(buttons[i]);
    }
  }

  function initHeaderScroll() {
    if (bus.headerScrollInited) return;
    bus.headerScrollInited = true;

    var header = document.querySelector('.l-header');
    if (!header) return;

    var lastScroll = 0;

    var scrollHandler = throttle(function() {
      var currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        header.style.boxShadow = 'var(--shadow-lg)';
      } else {
        header.style.boxShadow = 'var(--shadow-sm)';
      }

      lastScroll = currentScroll;
    }, 100);

    window.addEventListener('scroll', scrollHandler, { passive: true });
  }

  function initActiveMenuState() {
    if (bus.activeMenuInited) return;
    bus.activeMenuInited = true;

    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.c-nav__link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkPath = link.getAttribute('href');

      if (!linkPath || linkPath.startsWith('#')) continue;

      var isHome = currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/index.html');
      var linkIsHome = linkPath === '/' || linkPath === '/index.html' || linkPath === 'index.html';

      if ((isHome && linkIsHome) || (linkPath !== '/' && linkPath !== '/index.html' && currentPath.indexOf(linkPath) !== -1)) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('is-active', 'active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('is-active', 'active');
      }
    }
  }

  bus.init = function() {
    if (bus.initialized) return;
    bus.initialized = true;

    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initScrollAnimations();
    initImageAnimations();
    initButtonRipple();
    initCountUp();
    initFormValidation();
    initScrollToTop();
    initLanguageSwitcher();
    initHeaderScroll();
    initActiveMenuState();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bus.init);
  } else {
    bus.init();
  }

})();
