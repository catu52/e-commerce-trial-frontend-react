import { rejection } from '../test/utils';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { API, TEST_TOKEN } from '../test/handlers';
import { ApiError, apiRequest, getToken, setToken } from './api';

describe('token storage', () => {
  it('round-trips and clears the token', () => {
    expect(getToken()).toBeNull();
    setToken('abc');
    expect(getToken()).toBe('abc');
    setToken(null);
    expect(getToken()).toBeNull();
  });

  it('degrades gracefully when localStorage throws', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(getToken()).toBeNull();
    expect(() => setToken('x')).not.toThrow();
    get.mockRestore();
    set.mockRestore();
  });
});

describe('ApiError', () => {
  it('detail joins first message of each field error', () => {
    const err = new ApiError('invalid', 422, { email: ['bad email', 'x'], password: ['too short'] });
    expect(err.detail).toBe('bad email too short');
    expect(err.name).toBe('ApiError');
    expect(err).toBeInstanceOf(Error);
  });

  it('detail falls back to message without field errors', () => {
    expect(new ApiError('boom', 500).detail).toBe('boom');
  });
});

describe('apiRequest', () => {
  it('sends Accept header, no content-type on GET and no auth without a token', async () => {
    let headers!: Headers;
    server.use(
      http.get(`${API}/ping`, ({ request }) => {
        headers = request.headers;
        return HttpResponse.json({ ok: true });
      }),
    );
    await expect(apiRequest('/ping')).resolves.toEqual({ ok: true });
    expect(headers.get('accept')).toBe('application/json');
    expect(headers.get('authorization')).toBeNull();
    expect(headers.get('content-type')).toBeNull();
  });

  it('attaches the bearer token unless auth:false', async () => {
    setToken(TEST_TOKEN);
    const seen: (string | null)[] = [];
    server.use(
      http.get(`${API}/ping`, ({ request }) => {
        seen.push(request.headers.get('authorization'));
        return HttpResponse.json({});
      }),
    );
    await apiRequest('/ping');
    await apiRequest('/ping', { auth: false });
    expect(seen).toEqual([`Bearer ${TEST_TOKEN}`, null]);
  });

  it('serialises JSON bodies with content-type', async () => {
    let body: unknown;
    let ct: string | null = null;
    server.use(
      http.post(`${API}/echo`, async ({ request }) => {
        ct = request.headers.get('content-type');
        body = await request.json();
        return HttpResponse.json({});
      }),
    );
    await apiRequest('/echo', { method: 'POST', body: { a: 1 } });
    expect(body).toEqual({ a: 1 });
    expect(ct).toBe('application/json');
  });

  it('builds the query string, skipping empty values but keeping false and 0', async () => {
    let search = '';
    server.use(
      http.get(`${API}/q`, ({ request }) => {
        search = new URL(request.url).search;
        return HttpResponse.json({});
      }),
    );
    await apiRequest('/q', {
      query: { a: 'x y', b: undefined, c: null, d: '', e: false, f: 0 },
    });
    const params = new URLSearchParams(search);
    expect(params.get('a')).toBe('x y');
    expect(params.has('b') || params.has('c') || params.has('d')).toBe(false);
    expect(params.get('e')).toBe('false');
    expect(params.get('f')).toBe('0');
  });

  it('returns null for 204', async () => {
    server.use(http.delete(`${API}/gone`, () => new HttpResponse(null, { status: 204 })));
    await expect(apiRequest('/gone', { method: 'DELETE' })).resolves.toBeNull();
  });

  it('throws ApiError with status, message and field errors', async () => {
    server.use(
      http.post(`${API}/bad`, () =>
        HttpResponse.json({ message: 'Nope', errors: { email: ['taken'] } }, { status: 422 }),
      ),
    );
    const err = await rejection(apiRequest('/bad', { method: 'POST', body: {} }));
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(422);
    expect(err.message).toBe('Nope');
    expect(err.errors).toEqual({ email: ['taken'] });
  });

  it('uses a generic message when the error body is not JSON', async () => {
    server.use(http.get(`${API}/html`, () => new HttpResponse('<h1>500</h1>', { status: 500 })));
    const err = await rejection(apiRequest('/html'));
    expect(err.message).toBe('Request failed (500)');
    expect(err.errors).toEqual({});
  });

  it('maps network failures to status 0', async () => {
    server.use(http.get(`${API}/down`, () => HttpResponse.error()));
    const err = await rejection(apiRequest('/down'));
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
    expect(err.message).toMatch(/unable to reach the server/i);
  });

  it('aborts with ApiError when timeoutMs elapses', async () => {
    server.use(http.get(`${API}/slow`, async () => {
      await new Promise((r) => setTimeout(r, 200));
      return HttpResponse.json({});
    }));
    expect(await rejection(apiRequest('/slow', { timeoutMs: 20 }))).toMatchObject({ name: 'ApiError', status: 0 });
  });
});
