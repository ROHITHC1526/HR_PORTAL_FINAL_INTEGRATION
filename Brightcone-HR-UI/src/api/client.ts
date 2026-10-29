import axios, { AxiosError } from 'axios';
import { env } from '@/config/env';
import type { components } from './schema';

export type Session = components['schemas']['SessionResponse'];
export type Me = components['schemas']['MeResponse'];

// ---------------------------------------------------------------------------
// 1. Axios Client (used by Recruitment, Onboarding & Self-Service)
// ---------------------------------------------------------------------------

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== 'undefined') {
    if (!envUrl || envUrl.includes('localhost:5150') || envUrl.includes('127.0.0.1:5150') || envUrl === window.location.origin) {
      return '';
    }
  }
  return envUrl || 'http://localhost:5150';
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('brightcone_token') || getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    let message = 'An unexpected error occurred. Please try again.';
    if (error.response?.data?.error) {
      message = error.response.data.error;
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

// ---------------------------------------------------------------------------
// 2. Fetch Client (used by People Plus views, Payroll & Expenses)
// ---------------------------------------------------------------------------

const BASE = env?.apiUrl || '/api';
const CSRF = { 'X-Requested-With': 'brightcone' };

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let accessToken: string | null = null;
export const getAccessToken = () => accessToken || localStorage.getItem('brightcone_token');
export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem('brightcone_token');
};

type SessionListener = (session: Session | null) => void;
const listeners = new Set<SessionListener>();
export const onSessionChange = (fn: SessionListener) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
const notify = (s: Session | null) => listeners.forEach((fn) => fn(s));

export function adoptSession(session: Session) {
  accessToken = session.access_token;
  localStorage.setItem('brightcone_token', session.access_token);
}

async function toError(res: Response): Promise<ApiError> {
  let body: { error?: string; description?: string } = {};
  try {
    body = await res.json();
  } catch {
    /* not JSON */
  }
  return new ApiError(res.status, body.description ?? res.statusText, body.error);
}

let refreshing: Promise<Session | null> | null = null;

export function refreshSession(): Promise<Session | null> {
  refreshing ??= (async () => {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: CSRF,
    });
    if (!res.ok) {
      accessToken = null;
      return null;
    }
    const session = (await res.json()) as Session;
    accessToken = session.access_token;
    return session;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const send = () =>
    fetch(`${BASE}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
        ...init.headers,
      },
    });

  let res = await send();
  if (res.status === 401 && !path.startsWith('/auth/')) {
    const session = await refreshSession();
    if (!session) {
      notify(null);
      throw await toError(res);
    }
    notify(session);
    res = await send();
  }
  if (!res.ok) throw await toError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const json = (body: unknown): RequestInit => ({
  method: 'POST',
  body: JSON.stringify(body),
});
export const csrfHeaders = CSRF;
