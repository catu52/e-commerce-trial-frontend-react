import { rejection } from '../test/utils';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { API, TEST_TOKEN } from '../test/handlers';
import { ApiError, getToken, setToken } from '../lib/api';
import { login, logout, me, register, splitName } from './auth';

describe('splitName', () => {
  it.each([
    ['Ada Lovelace', 'Ada', 'Lovelace'],
    ['  Ada   Byron King  ', 'Ada', 'Byron King'],
    ['Cher', 'Cher', 'Cher'],
  ])('%j -> %s / %s', (full, first, last) => {
    expect(splitName(full)).toEqual({ first_name: first, last_name: last });
  });
});

describe('auth service', () => {
  it('login stores the token and returns the client', async () => {
    const client = await login('ada@example.com', 'password123');
    expect(client.email).toBe('ada@example.com');
    expect(getToken()).toBe(TEST_TOKEN);
  });

  it('login failure does not store a token', async () => {
    const err = await rejection(login('ada@example.com', 'wrong'));
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
    expect(getToken()).toBeNull();
  });

  it('login does not send a stale Authorization header', async () => {
    setToken('stale');
    let auth: string | null = 'unset';
    server.use(
      http.post(`${API}/client/login`, ({ request }) => {
        auth = request.headers.get('authorization');
        return HttpResponse.json({ token: 't', client: {} });
      }),
    );
    await login('a@b.c', 'password123');
    expect(auth).toBeNull();
  });

  it('register posts the payload, stores the token', async () => {
    let body: unknown;
    server.use(
      http.post(`${API}/client/register`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ token: 'new', client: { id: 1 } }, { status: 201 });
      }),
    );
    const input = { first_name: 'A', last_name: 'B', email: 'a@b.c', password: 'password123', password_confirmation: 'password123' };
    await register(input);
    expect(body).toEqual(input);
    expect(getToken()).toBe('new');
  });

  it('register surfaces validation errors', async () => {
    const err = await rejection(register({
      first_name: 'A', last_name: 'B', email: 'taken@example.com', password: 'x', password_confirmation: 'x',
    }));
    expect(err.status).toBe(422);
    expect(err.errors.email[0]).toMatch(/taken/);
    expect(getToken()).toBeNull();
  });

  it('me returns the client when authenticated and 401s otherwise', async () => {
    setToken(TEST_TOKEN);
    await expect(me()).resolves.toMatchObject({ email: 'ada@example.com' });
    setToken(null);
    await expect(me()).rejects.toMatchObject({ status: 401 });
  });

  it('logout clears the token', async () => {
    setToken(TEST_TOKEN);
    await logout();
    expect(getToken()).toBeNull();
  });

  it('logout clears the token even when the API call fails', async () => {
    setToken(TEST_TOKEN);
    server.use(http.post(`${API}/client/logout`, () => HttpResponse.json({ message: 'x' }, { status: 500 })));
    await expect(logout()).rejects.toBeInstanceOf(ApiError);
    expect(getToken()).toBeNull();
  });
});
