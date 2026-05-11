/**
 * Outgoing email via Resend REST API. No SDK dependency — plain fetch.
 *
 * If RESEND_API_KEY is unset the helper no-ops (logs to console) so that
 * local dev and CI never need real credentials.
 *
 * Server-side only. Never import from client components.
 */

type SendResult = { ok: true; id?: string } | { ok: false; error: string }

interface SendEmailInput {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM ?? 'Gumtree UK <no-reply@gumtree-uk.dev>'

  if (!apiKey) {
    console.log('[email:dry-run]', { to, subject })
    return { ok: true }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html, text: text ?? stripHtml(html) }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.error('[email] resend error', data)
      return { ok: false, error: data?.message ?? 'Send failed' }
    }
    return { ok: true, id: data.id }
  } catch (err) {
    console.error('[email] fetch error', err)
    return { ok: false, error: err instanceof Error ? err.message : 'Send failed' }
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export function newMessageEmail(opts: {
  recipientName: string
  senderName: string
  listingTitle: string
  conversationId: string
  preview: string
}) {
  const url = `${SITE_URL}/messages/${opts.conversationId}`
  const preview = opts.preview.length > 160 ? opts.preview.slice(0, 160) + '…' : opts.preview
  return {
    subject: `New message from ${opts.senderName} about "${opts.listingTitle}"`,
    html: `
      <p>Hi ${escapeHtml(opts.recipientName)},</p>
      <p><strong>${escapeHtml(opts.senderName)}</strong> sent you a message about
         <em>${escapeHtml(opts.listingTitle)}</em>:</p>
      <blockquote style="border-left:3px solid #0D475C;margin:0;padding:8px 12px;color:#555">
        ${escapeHtml(preview)}
      </blockquote>
      <p><a href="${url}" style="display:inline-block;padding:10px 18px;background:#e75462;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">Reply</a></p>
      <p style="color:#888;font-size:12px">You're receiving this because you have email notifications enabled. Manage in <a href="${SITE_URL}/account/profile">account settings</a>.</p>
    `,
  }
}

export function reportResolvedEmail(opts: {
  recipientName: string
  listingTitle: string
  outcome: 'resolved' | 'dismissed'
}) {
  const verb = opts.outcome === 'resolved' ? 'taken action on' : 'reviewed and dismissed'
  return {
    subject: `Your report has been ${opts.outcome}`,
    html: `
      <p>Hi ${escapeHtml(opts.recipientName)},</p>
      <p>Our moderation team has ${verb} your report on <em>${escapeHtml(opts.listingTitle)}</em>.</p>
      <p>Thanks for helping keep Gumtree safe.</p>
    `,
  }
}

export function listingApprovedEmail(opts: { recipientName: string; listingTitle: string; listingId: string }) {
  const url = `${SITE_URL}/listings/${opts.listingId}`
  return {
    subject: `Your ad "${opts.listingTitle}" is live`,
    html: `
      <p>Hi ${escapeHtml(opts.recipientName)},</p>
      <p>Your ad <em>${escapeHtml(opts.listingTitle)}</em> has been approved and is now live.</p>
      <p><a href="${url}">View your listing</a></p>
    `,
  }
}

export function listingRejectedEmail(opts: { recipientName: string; listingTitle: string; reason?: string | null }) {
  return {
    subject: `Your ad "${opts.listingTitle}" was rejected`,
    html: `
      <p>Hi ${escapeHtml(opts.recipientName)},</p>
      <p>Unfortunately your ad <em>${escapeHtml(opts.listingTitle)}</em> didn't meet our marketplace rules.</p>
      ${opts.reason ? `<p><strong>Reason:</strong> ${escapeHtml(opts.reason)}</p>` : ''}
      <p>You can edit and resubmit from your <a href="${SITE_URL}/account/my-ads">My Ads</a> page.</p>
    `,
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
