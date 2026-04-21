// Supabase Edge Function — notify-contact
//
// Sends an email notification to casualflightservices@gmail.com every time
// a row is inserted into public.contacts. Wired up via a Supabase Database
// Webhook (see SUPABASE_SETUP.md).
//
// Required secrets (set in Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY   — from https://resend.com/api-keys
//
// Optional:
//   NOTIFY_TO_EMAIL  — override the recipient (defaults to Gmail address below)
//   NOTIFY_FROM      — override the sender (defaults to Resend sandbox address)

const NOTIFY_TO_EMAIL = Deno.env.get("NOTIFY_TO_EMAIL") ?? "casualflightservices@gmail.com";
const NOTIFY_FROM     = Deno.env.get("NOTIFY_FROM")     ?? "Casual Flight Services <onboarding@resend.dev>";
const RESEND_API_KEY  = Deno.env.get("RESEND_API_KEY");

interface ContactRow {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  inquiry_type: string | null;
  service: string | null;
  message: string;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: ContactRow | null;
  old_record: ContactRow | null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderEmail(row: ContactRow): { subject: string; text: string; html: string } {
  const name = `${row.first_name} ${row.last_name}`.trim();
  const subject = `New inquiry from ${name}${row.inquiry_type ? ` (${row.inquiry_type})` : ""}`;

  const text = [
    "New contact form submission — Casual Flight Services",
    "",
    `Name:               ${name}`,
    `Email:              ${row.email}`,
    `Phone:              ${row.phone || "(not provided)"}`,
    `Inquiring as:       ${row.inquiry_type || "(not specified)"}`,
    `Service of interest: ${row.service || "(not specified)"}`,
    "",
    "Message:",
    row.message,
    "",
    "--",
    `Submitted: ${row.created_at}`,
    `Record ID: ${row.id}`,
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #0F1216; max-width: 560px; margin: 0 auto; padding: 24px;">
      <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #5A6577; margin: 0 0 8px;">Casual Flight Services</p>
      <h1 style="font-size: 22px; margin: 0 0 16px; color: #0A1F44;">New inquiry from ${escapeHtml(name)}</h1>
      <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
        <tr><td style="padding: 6px 0; color: #5A6577; width: 140px;">Email</td><td style="padding: 6px 0;"><a href="mailto:${escapeHtml(row.email)}" style="color: #0A1F44;">${escapeHtml(row.email)}</a></td></tr>
        <tr><td style="padding: 6px 0; color: #5A6577;">Phone</td><td style="padding: 6px 0;">${escapeHtml(row.phone || "(not provided)")}</td></tr>
        <tr><td style="padding: 6px 0; color: #5A6577;">Inquiring as</td><td style="padding: 6px 0;">${escapeHtml(row.inquiry_type || "(not specified)")}</td></tr>
        <tr><td style="padding: 6px 0; color: #5A6577;">Service</td><td style="padding: 6px 0;">${escapeHtml(row.service || "(not specified)")}</td></tr>
      </table>
      <hr style="border: 0; border-top: 1px solid #E4E7EC; margin: 20px 0;">
      <p style="font-size: 12px; color: #5A6577; margin: 0 0 8px;">Message</p>
      <div style="background: #F8F9FC; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.55; white-space: pre-wrap;">${escapeHtml(row.message)}</div>
      <p style="font-size: 11px; color: #9AA3B2; margin-top: 24px;">Submitted ${escapeHtml(row.created_at)} · Record ID ${escapeHtml(row.id)}</p>
    </div>
  `.trim();

  return { subject, text, html };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ ok: false, error: "RESEND_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Only act on INSERTs into the contacts table.
  if (payload.type !== "INSERT" || payload.table !== "contacts" || !payload.record) {
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { subject, text, html } = renderEmail(payload.record);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: NOTIFY_FROM,
      to: [NOTIFY_TO_EMAIL],
      reply_to: payload.record.email,
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return new Response(JSON.stringify({ ok: false, error: err }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await res.json();
  return new Response(JSON.stringify({ ok: true, id: data.id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
