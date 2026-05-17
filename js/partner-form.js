/* Casual Flight Services — partner form → Supabase
 *
 * Reuses the existing `contacts` table (no extra schema). The B2B-only
 * fields (company, role, org type, stations) are packed into the
 * `message` column with clear labels so the partnerships team can scan
 * leads in the same inbox they already use. `inquiry_type` is forced to
 * "Partner" so admin can filter for B2B vs traveler inquiries.
 *
 * Mirrors js/contact-form.js intentionally — same submit pattern, same
 * status block id, same Supabase credentials. Only the field mapping is
 * different.
 */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://rhmxgbdkfrppntfuukfv.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_mKO-jWmnPh2u1n0Dpsthrw_zRKguT1J';

  const form = document.getElementById('partnerForm');
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

    // Split the contact name on the first space so we can populate
    // first_name / last_name on the contacts table without adding new
    // columns. Anything after the first space becomes last_name; a
    // single-word entry leaves last_name as a single character so the
    // NOT NULL constraint is satisfied.
    const fullName = form.contactName.value.trim();
    const [firstName, ...rest] = fullName.split(/\s+/);
    const lastName = rest.join(' ') || '-';

    const message =
      `[B2B Partner inquiry]\n` +
      `Company: ${form.company.value.trim()}\n` +
      `Org type: ${form.orgType.value || '—'}\n` +
      `Role: ${form.role.value.trim() || '—'}\n` +
      `Stations / markets: ${form.stations.value.trim() || '—'}\n` +
      `Service interest: ${form.serviceInterest.value || '—'}\n\n` +
      form.message.value.trim();

    const payload = {
      first_name:   firstName || fullName,
      last_name:    lastName,
      email:        form.email.value.trim(),
      phone:        form.phone.value.trim() || null,
      inquiry_type: 'Partner',
      service:      form.serviceInterest.value || null,
      message,
    };

    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending…';
    setStatus('Sending your inquiry…', 'info');

    try {
      const { error } = await client.from('contacts').insert(payload);
      if (error) throw error;
      setStatus(
        "Thanks — your inquiry is in front of the partnerships team. You'll hear back within one business day.",
        'success'
      );
      form.reset();
    } catch (err) {
      console.error('Supabase insert failed:', err);
      setStatus(
        "Something went wrong sending your inquiry. Please try again, or email partnerships@casualflightservices.com.",
        'error'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
})();
