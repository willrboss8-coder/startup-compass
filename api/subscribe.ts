import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { email, source, topModelId } = req.body ?? {};

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

    await resend.emails.send({
      from: 'Startup Compass <onboarding@resend.dev>',
      to: [notifyTo],
      subject: `New subscriber: ${email}`,
      html: [
        `<h2>New Startup Compass subscriber</h2>`,
        `<p><strong>Email:</strong> ${email}</p>`,
        `<p><strong>Source:</strong> ${source || 'unknown'}</p>`,
        `<p><strong>Top model:</strong> ${topModelId || 'none'}</p>`,
        `<p><strong>Time:</strong> ${new Date().toISOString()}</p>`,
      ].join('\n'),
    });

    return res.status(200).json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Resend error:', message);
    return res.status(500).json({ ok: false, error: 'Failed to process subscription' });
  }
}
