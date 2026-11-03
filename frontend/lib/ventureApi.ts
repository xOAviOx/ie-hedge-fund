// Client for the Venture discovery log and traction endpoints (/api/v1/venture/*).
import { API_BASE } from './api';

export type InterviewKind = 'customer' | 'exemplar';

export interface InterviewIn {
  kind: InterviewKind;
  name: string;
  segment: string;
  date: string;
  channel: string;
  pains: string;
  gains: string;
  quotes: string;
  willingness_to_pay: string;
  notes: string;
}

export interface Interview extends InterviewIn {
  id: number;
  created_at: string;
}

export interface VentureMetrics {
  runs: number;
  orders: number;
  nav: number | null;
  nav_return_pct: number | null;
  waitlist_total: number;
  interviews_customer: number;
  interviews_exemplar: number;
  agents: number;
  personas: number;
  universe_size: number;
}

const BASE = `${API_BASE}/api/v1/venture`;

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      cache: 'no-store',
    });
  } catch {
    throw new Error(`Network error — is the API running at ${API_BASE}?`);
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body: unknown = await res.json();
      if (body && typeof body === 'object' && 'detail' in body) {
        const d = (body as { detail: unknown }).detail;
        detail = typeof d === 'string' ? d : JSON.stringify(d);
      }
    } catch {
      /* keep statusText */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export const ventureApi = {
  metrics: () => call<VentureMetrics>('/metrics'),
  interviews: (kind: InterviewKind) =>
    call<{ interviews: Interview[] }>(`/interviews?kind=${kind}`).then((r) => r.interviews),
  createInterview: (body: InterviewIn) =>
    call<Interview>('/interviews', { method: 'POST', body: JSON.stringify(body) }),
  updateInterview: (id: number, body: InterviewIn) =>
    call<Interview>(`/interviews/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteInterview: (id: number) => call<{ deleted: boolean }>(`/interviews/${id}`, { method: 'DELETE' }),
};
