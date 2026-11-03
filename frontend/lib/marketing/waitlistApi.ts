import { API_BASE } from '@/lib/api';
import type { PricingTier } from '@/lib/company';

export type WaitlistPlan = PricingTier['id'];

export interface WaitlistSignup {
  email: string;
  plan: WaitlistPlan;
  name?: string;
  college?: string;
}

export interface WaitlistJoinResult {
  ok: true;
  position: number;
}

export interface WaitlistStats {
  total: number;
  by_plan: Record<string, number>;
}

const WAITLIST_URL = `${API_BASE}/api/v1/waitlist`;

async function send<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
  } catch {
    throw new Error('Could not reach the PortAI server. Please try again in a moment.');
  }
  if (!res.ok) {
    if (res.status === 422) throw new Error('Please enter a valid email address.');
    let detail = `Something went wrong (${res.status}). Please try again.`;
    try {
      const body: unknown = await res.json();
      if (body && typeof body === 'object' && 'detail' in body && typeof body.detail === 'string') detail = body.detail;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

export function joinWaitlist(signup: WaitlistSignup): Promise<WaitlistJoinResult> {
  const body: WaitlistSignup = { email: signup.email.trim(), plan: signup.plan };
  if (signup.name?.trim()) body.name = signup.name.trim();
  if (signup.college?.trim()) body.college = signup.college.trim();
  return send<WaitlistJoinResult>(WAITLIST_URL, { method: 'POST', body: JSON.stringify(body) });
}

export function getWaitlistStats(): Promise<WaitlistStats> {
  return send<WaitlistStats>(`${WAITLIST_URL}/stats`);
}
