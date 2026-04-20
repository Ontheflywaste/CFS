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

## Supabase setup (one-time)

The contact form writes to a `contacts` table using the Supabase publishable key.
Publishable keys are safe to ship in client code — they can only do what the `anon`
role is allowed to do via Row Level Security.

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste and run:

```sql
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name  text not null,
  email      text not null,
  phone      text,
  inquiry_type text,
  service    text,
  message    text not null
);

alter table public.contacts enable row level security;

create policy "Allow anonymous inserts"
  on public.contacts for insert to anon with check (true);
```

3. That's it. Submissions from `contact.html` will land in the `contacts` table.

**Where the keys live:** `js/contact-form.js` (top of file). If the project URL or
publishable key changes, update them there.

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
