# Casual Flight Services — Website Mockup

A static HTML/CSS/JS mockup for Casual Flight Services, a baggage and airport logistics company.

## What's here

- `index.html` — Landing page (hero, services, how it works, for travelers, for airlines, stats, testimonials, CTA)
- `services.html` — Detail pages for the four service lines + pricing
- `about.html` — Mission, values, leadership, careers, press
- `contact.html` — Contact info + form (wired to Supabase)
- `css/styles.css` — Full design system (tokens, components, responsive)
- `js/main.js` — Sticky header, mobile nav, scroll reveals
- `js/contact-form.js` — Supabase insert for contact submissions
- `supabase/functions/notify-contact/index.ts` — Edge Function that emails new submissions via Resend
- `SUPABASE_SETUP.md` — Click-by-click setup for the contacts table, edge function, webhook, and email
- `vercel.json` — Tells Vercel to serve this as a plain static site

## Design

- **Palette:** Navy / White / Black (with a light off-white `#F8F9FC` for section alternation)
- **Typeface:** Inter (loaded from Google Fonts)
- **Logo:** "Casual Flight Services" wordmark in Inter bold, with a small navy accent dot
- **Aesthetic:** Sits between Bags Inc (utilitarian) and Roadie (modern consumer) — professional, sleek, airline-grade trust

## Run locally

No build step — just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Supabase setup

Full, click-by-click instructions — including the Resend + webhook wiring
for email notifications to `casualflightservices@gmail.com` — live in
[`SUPABASE_SETUP.md`](SUPABASE_SETUP.md).

TL;DR of what's needed:
1. Create the `contacts` table + RLS policy (SQL in the setup doc).
2. Deploy the edge function at `supabase/functions/notify-contact/`.
3. Add a `RESEND_API_KEY` secret + a Database Webhook on inserts.

**Where the Supabase keys live:** `js/contact-form.js` (top of file). If
the project URL or publishable key changes, update them there.

## Deploy on Vercel

This is a pure static site, not a Next.js project. The `vercel.json` disables the
auto-detected Next.js build so Vercel just uploads the files.

If Vercel still tries to run `next build` after this commit:

1. Open the project in the Vercel dashboard → **Settings → Build & Development Settings**.
2. Set **Framework Preset** to **Other**.
3. Leave **Build Command**, **Install Command**, and **Output Directory** blank (or set Output Directory to `.`).
4. Redeploy.

## Notes

- Stock imagery is loaded from Unsplash via URL for the mockup; swap for real photography before launch.
- The `contacts` table is insert-only for anonymous users — viewing submissions still requires an authenticated Supabase session (or the service role key on the server side).
