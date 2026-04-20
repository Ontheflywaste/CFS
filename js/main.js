/* Casual Flight Services — main.js */
(function () {
  'use strict';

  // Sticky header shadow on scroll
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle
  const toggle = document.getElementById('navToggle');
  const mobile = document.getElementById('mobileMenu');
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      const open = mobile.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    mobile.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        mobile.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scroll reveal via IntersectionObserver
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // Contact form (mockup-only: simulates a submit)
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const required = form.querySelectorAll('[required]');
      let ok = true;
      required.forEach((el) => {
        if (!el.value) {
          ok = false;
          el.style.borderColor = '#DC2626';
        } else {
          el.style.borderColor = '';
        }
      });
      if (!ok) {
        status.style.display = 'block';
        status.style.background = '#FEE2E2';
        status.style.color = '#7F1D1D';
        status.textContent = 'Please fill in the required fields.';
        return;
      }
      status.style.display = 'block';
      status.style.background = 'var(--navy-50)';
      status.style.color = 'var(--navy-900)';
      status.textContent = "Thanks — we've received your message and will be in touch shortly.";
      form.reset();
    });
  }
})();
