/**
 * Email capture abstraction layer.
 *
 * Calls /api/subscribe (Vercel serverless + Resend) first.
 * Falls back to localStorage if the API is unreachable.
 */

export interface EmailSubscriber {
  email: string;
  source: 'results' | 'landing' | 'upgrade';
  capturedAt: string;
  topModelId?: string;
}

export interface SubscribeContext {
  topModelId?: string;
  topModelTitle?: string;
  confidenceLabel?: string;
  planSummary?: string;
}

const STORAGE_KEY = 'startup-compass-emails';

function loadEmails(): EmailSubscriber[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistEmail(subscriber: EmailSubscriber): void {
  try {
    const existing = loadEmails();
    if (!existing.some((s) => s.email === subscriber.email)) {
      existing.push(subscriber);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
  } catch {
    // silently fail
  }
}

export async function subscribeEmail(
  email: string,
  source: EmailSubscriber['source'],
  context?: SubscribeContext
): Promise<{ ok: boolean; error?: string }> {
  const subscriber: EmailSubscriber = {
    email,
    source,
    capturedAt: new Date().toISOString(),
    topModelId: context?.topModelId,
  };

  try {
    console.log('[emailService] POSTing to /api/subscribe');
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        source,
        topModelId: context?.topModelId,
        topModelTitle: context?.topModelTitle,
        confidenceLabel: context?.confidenceLabel,
        planSummary: context?.planSummary,
      }),
    });
    console.log('[emailService] response status:', res.status);
    const data = await res.json();

    if (data.ok) {
      persistEmail(subscriber);
      return { ok: true };
    }
    return { ok: false, error: data.error || 'Subscription failed' };
  } catch (err) {
    console.error('[emailService] fetch failed, falling back to localStorage:', err);
    persistEmail(subscriber);
    return { ok: true };
  }
}

export async function isEmailSubscribed(email: string): Promise<boolean> {
  return loadEmails().some((s) => s.email === email);
}

export function getLocalSubscriberCount(): number {
  return loadEmails().length;
}
