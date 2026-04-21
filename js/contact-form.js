/* Casual Flight Services — contact form → Supabase
 *
 * Uses the Supabase JS v2 UMD client (loaded from CDN in contact.html).
 * The publishable key is safe to ship in client code; it can only do
 * what the `anon` role is allowed to do via Row Level Security.
 *
 * Required Supabase setup (run once in the SQL editor):
 *
 *   create table public.contacts (
 *     id uuid primary key default gen_random_uuid(),
 *     created_at timestamptz not null default now(),
 *     first_name text not null,
 *     last_name  text not null,
 *     email      text not null,
 *     phone      text,
 *     inquiry_type text,
 *     service    text,
 *     message    text not null
 *   );
 *   alter table public.contacts enable row level security;
 *   create policy "Allow anonymous inserts"
 *     on public.contacts for insert to anon with check (true);
 */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://rhmxgbdkfrppntfuukfv.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_mKO-jWmnPh2u1n0Dpsthrw_zRKguT1J';

  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Supabase JS client not loaded.');
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const submitBtn = form.querySelector('button[type="submit"]');

  function setStatus(message, tone) {
    status.style.display = 'block';
    status.textContent = message;
    if (tone === 'error') {
      status.style.background = '#FEE2E2';
      status.style.color = '#7F1D1D';
    } else if (tone === 'info') {
      status.style.background = 'var(--navy-50)';
      status.style.color = 'var(--navy-900)';
    } else {
      status.style.background = '#DCFCE7';
      status.style.color = '#14532D';
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic client-side validation
    const required = form.querySelectorAll('[required]');
    let ok = true;
    required.forEach((el) => {
      if (!el.value.trim()) {
        ok = false;
        el.style.borderColor = '#DC2626';
      } else {
        el.style.borderColor = '';
      }
    });
    if (!ok) {
      setStatus('Please fill in the required fields.', 'error');
      return;
    }

    const payload = {
      first_name:   form.firstName.value.trim(),
      last_name:    form.lastName.value.trim(),
      email:        form.email.value.trim(),
      phone:        form.phone.value.trim() || null,
      inquiry_type: form.type.value || null,
      service:      form.service.value || null,
      message:      form.message.value.trim(),
    };

    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending…';
    setStatus('Sending your message…', 'info');

    try {
      const { error } = await client.from('contacts').insert(payload);
      if (error) throw error;
      setStatus(
        "Thanks — we've received your message and will be in touch shortly.",
        'success'
      );
      form.reset();
    } catch (err) {
      console.error('Supabase insert failed:', err);
      setStatus(
        "Something went wrong sending your message. Please try again, or email casualflightservices@gmail.com.",
        'error'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
})();
