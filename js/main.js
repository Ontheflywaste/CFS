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

  // (Contact dropdown JS removed — Partner With Us is now a standalone
  // nav-cta button in every header. Contact links straight to contact.html.)

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

  // Graceful image fallback — if any <img> fails to load, swap it for a
  // styled navy placeholder so the layout never shows broken-image icons.
  const placeholderFor = (label) => {
    const safe = String(label || 'image').replace(/[<>&"']/g, '');
    return (
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'>
          <defs>
            <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
              <stop offset='0' stop-color='#0A1F44'/>
              <stop offset='1' stop-color='#061432'/>
            </linearGradient>
          </defs>
          <rect width='800' height='600' fill='url(#g)'/>
          <g fill='white' opacity='0.85'>
            <path d='M400 250l90 35-35 35 20 60-75-40-75 40 20-60-35-35z' opacity='0.18'/>
            <circle cx='400' cy='300' r='4'/>
          </g>
          <text x='400' y='360' text-anchor='middle' font-family='Inter,sans-serif'
                font-size='22' font-weight='600' fill='white' opacity='0.85'>${safe}</text>
        </svg>`
      )
    );
  };

  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = '1';
      img.src = placeholderFor(img.alt);
      img.style.objectFit = 'cover';
      img.style.background = 'var(--navy-700)';
    });
  });

  // NOTE: Contact form submission is handled separately in js/contact-form.js
  // so this file remains a shared, page-agnostic bundle.
})();
