import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const {
    email,
    source,
    topModelId,
    topModelTitle,
    confidenceLabel,
    planSummary,
  } = req.body ?? {};

  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email address' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ ok: false, error: 'Server configuration error' });
  }

  const notifyTo = process.env.NOTIFY_EMAIL || 'delivered@resend.dev';

  try {
    const resend = new Resend(apiKey);

    const rows = [
      `<h2>New Startup Compass subscriber</h2>`,
      `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">`,
      row('Email', email),
      row('Source', source || 'unknown'),
      row('Top model', topModelTitle || topModelId || 'none'),
      row('Model ID', topModelId || 'none'),
      row('Confidence', confidenceLabel || 'N/A'),
      row('Plan summary', planSummary || 'N/A'),
      row('Timestamp', new Date().toISOString()),
      `</table>`,
    ];

    await resend.emails.send({
      from: 'Startup Compass <onboarding@resend.dev>',
      to: [notifyTo],
      subject: `New subscriber: ${email}`,
      html: rows.join('\n'),
    });

    return res.status(200).json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Resend error:', message);
    return res.status(500).json({ ok: false, error: 'Failed to process subscription' });
  }
}

function row(label: string, value: string): string {
  return [
    `<tr>`,
    `<td style="padding:4px 12px 4px 0;font-weight:600;color:#475569">${esc(label)}</td>`,
    `<td style="padding:4px 0;color:#1e293b">${esc(value)}</td>`,
    `</tr>`,
  ].join('');
}
