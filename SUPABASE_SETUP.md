# Supabase Setup — Casual Flight Services

This doc covers everything you need to click in Supabase / Resend to make
the contact form fully functional, including email notifications to
`casualflightservices@gmail.com` on every new submission.

## 1. Contacts table (required — runs the form)

If you haven't already:

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste and run:

```sql
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name   text not null,
  last_name    text not null,
  email        text not null,
  phone        text,
  inquiry_type text,
  service      text,
  message      text not null
);

alter table public.contacts enable row level security;

create policy "Allow anonymous inserts"
  on public.contacts for insert to anon with check (true);
```

After this, form submissions will land in the `contacts` table. You can
see them in **Table Editor → contacts**.

## 2. Email notifications (optional but recommended)

The pattern is: form inserts a row → a Supabase Database Webhook fires →
a Supabase Edge Function calls Resend → email hits your Gmail inbox.

### 2a. Get a Resend API key

1. Sign up at https://resend.com (free tier is 3,000 emails/month).
2. **API Keys** → **Create API Key** → name it `cfs-notify`, give it
   "Sending access" only.
3. Copy the key — you'll paste it in step **2c**.

> During testing you can send from `onboarding@resend.dev` to your Gmail.
> Once you have the custom domain (e.g. `casualflightservices.com`),
> verify it in Resend → **Domains** and update `NOTIFY_FROM` in step 2c
> to `Casual Flight Services <contact@casualflightservices.com>` so
> emails land in Inbox instead of Spam.

### 2b. Deploy the edge function

Two options — pick whichever is easier.

**Option A — Supabase Dashboard (no CLI):**
1. Supabase project → **Edge Functions** → **Deploy a new function**.
2. Name it `notify-contact` exactly.
3. Copy the contents of [`supabase/functions/notify-contact/index.ts`](supabase/functions/notify-contact/index.ts) from this repo and paste into the editor.
4. Click **Deploy function**.

**Option B — Supabase CLI (if you have it installed):**
```bash
# from the repo root
supabase link --project-ref rhmxgbdkfrppntfuukfv
supabase functions deploy notify-contact
```

### 2c. Set the Resend secret

1. Supabase project → **Edge Functions** → click `notify-contact` → **Secrets**.
2. Add `RESEND_API_KEY` = the key you copied in step 2a. Save.
3. (Optional) Add `NOTIFY_TO_EMAIL` if you want to override the Gmail recipient.

### 2d. Create the Database Webhook

1. Supabase project → **Database** → **Webhooks** → **Create a new hook**.
2. Fill in:
   - **Name:** `notify-contact-on-insert`
   - **Table:** `contacts`
   - **Events:** check **Insert** only
   - **Type:** **Supabase Edge Functions**
   - **Edge Function:** `notify-contact`
   - **HTTP Method:** `POST`
   - **HTTP Headers:** leave defaults (Supabase adds auth + JSON headers)
3. Save.

### 2e. Test it

1. Open your deployed site → Contact page → fill out and submit the form.
2. Within a few seconds you should see:
   - A new row in **Table Editor → contacts**
   - An email in `casualflightservices@gmail.com`
3. If the email doesn't arrive, open **Edge Functions → notify-contact → Logs**
   to see the error (most common: missing `RESEND_API_KEY`, or Resend
   rate-limit on the sandbox domain).

## 3. Monitoring

- Inspect submissions any time in **Table Editor → contacts**.
- Export all submissions as CSV with the **Export** button.
- To prevent the table from growing forever, you can add a monthly
  reminder to archive or clear old rows.

## Security notes

- The publishable key shipped in the site is safe to expose — it only
  grants the permissions defined by your RLS policy, which is *insert
  only* on `contacts`. Users cannot read, update, or delete.
- The edge function has no authentication beyond Supabase's internal
  webhook signature. For a higher-security setup, add a shared secret
  header in the webhook config and verify it inside the function.
