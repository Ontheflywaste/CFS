# Casual Flight Services — Website Mockup

A static HTML/CSS/JS mockup for Casual Flight Services (CFS), a baggage and airport logistics company.

## What's here

- `index.html` — Landing page (hero, services, how it works, for travelers, for airlines, stats, testimonials, CTA)
- `services.html` — Detail pages for the four service lines + pricing
- `about.html` — Mission, values, leadership, careers, press
- `contact.html` — Contact info + form
- `css/styles.css` — Full design system (tokens, components, responsive)
- `js/main.js` — Sticky header, mobile nav, scroll reveals, form handler

## Design

- **Palette:** Navy / White / Black (with a light off-white `#F8F9FC` for section alternation)
- **Typeface:** Inter (loaded from Google Fonts)
- **Aesthetic:** Sits between Bags Inc (utilitarian) and Roadie (modern consumer) — professional, sleek, airline-grade trust

## Run locally

No build step — just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Notes

- Stock imagery is loaded from Unsplash via URL for the mockup; swap for real photography before launch.
- The contact form is mockup-only (simulated submit). See project notes about wiring up to Supabase.
