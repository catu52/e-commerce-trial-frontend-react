import { apiRequest, setToken } from '../lib/api';

export interface Client {
  id: number | string;
  name: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
}

interface AuthResponse {
  message: string;
  token: string;
  client: Client;
}

export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Splits a full name once; a single word is used for both parts.
export function splitName(fullName: string): { first_name: string; last_name: string } {
  const [first, ...rest] = fullName.trim().split(/\s+/);
  return { first_name: first, last_name: rest.join(' ') || first };
}

export async function login(email: string, password: string): Promise<Client> {
  const res = await apiRequest<AuthResponse>('/client/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
  setToken(res.token);
  return res.client;
}

export async function register(input: RegisterInput): Promise<Client> {
  const res = await apiRequest<AuthResponse>('/client/register', {
    method: 'POST',
    body: input,
    auth: false,
  });
  setToken(res.token);
  return res.client;
}

export async function me(): Promise<Client> {
  const res = await apiRequest<{ client: Client }>('/client/me');
  return res.client;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest('/client/logout', { method: 'POST' });
  } finally {
    setToken(null);
  }
}
