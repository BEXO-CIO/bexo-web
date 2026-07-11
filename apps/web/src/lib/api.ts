import { BexoApiClient } from '@bexo/shared';

// Fallback to local dev port 3000 if not specified in environment
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api/v1';

const initialToken = localStorage.getItem('bexo_access_token') || undefined;

export const client = new BexoApiClient({
  baseUrl: API_BASE_URL,
  token: initialToken,
});

export function setAccessToken(token: string | undefined) {
  if (token) {
    localStorage.setItem('bexo_access_token', token);
    client.setToken(token);
  } else {
    localStorage.removeItem('bexo_access_token');
    client.setToken(undefined);
  }
}

export function getUserIdFromToken(): string | null {
  const token = localStorage.getItem('bexo_access_token');
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub || null;
  } catch (e) {
    return null;
  }
}
