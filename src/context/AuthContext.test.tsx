import { http, HttpResponse } from 'msw';
import { act, render, screen, waitFor } from '@testing-library/react';
import { server } from '../test/server';
import { API, TEST_TOKEN } from '../test/handlers';
import { renderWithProviders } from '../test/utils';
import { getToken, setToken } from '../lib/api';
import { AuthProvider, useAuth } from './AuthContext';

let ctx!: ReturnType<typeof useAuth>;
const Probe = () => {
  ctx = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="client">{ctx.client?.email ?? 'none'}</span>
    </div>
  );
};

const client = () => screen.getByTestId('client').textContent;
const loading = () => screen.getByTestId('loading').textContent;

describe('AuthProvider', () => {
  it('is not loading and has no client when there is no token', () => {
    renderWithProviders(<Probe />);
    expect(loading()).toBe('false');
    expect(client()).toBe('none');
  });

  it('hydrates the client from /client/me when a token exists', async () => {
    setToken(TEST_TOKEN);
    renderWithProviders(<Probe />);
    expect(loading()).toBe('true');
    await waitFor(() => expect(client()).toBe('ada@example.com'));
    expect(loading()).toBe('false');
  });

  it('clears an invalid token when /client/me fails', async () => {
    setToken('expired');
    renderWithProviders(<Probe />);
    await waitFor(() => expect(loading()).toBe('false'));
    expect(client()).toBe('none');
    expect(getToken()).toBeNull();
  });

  it('login sets the client and token', async () => {
    renderWithProviders(<Probe />);
    await act(() => ctx.login('ada@example.com', 'password123'));
    expect(client()).toBe('ada@example.com');
    expect(getToken()).toBe(TEST_TOKEN);
  });

  it('login failure rejects and leaves the user logged out', async () => {
    renderWithProviders(<Probe />);
    await expect(act(() => ctx.login('ada@example.com', 'bad'))).rejects.toMatchObject({ status: 401 });
    expect(client()).toBe('none');
  });

  it('register sets the client', async () => {
    renderWithProviders(<Probe />);
    await act(() =>
      ctx.register({ first_name: 'Grace', last_name: 'Hopper', email: 'g@h.io', password: 'password123', password_confirmation: 'password123' }),
    );
    expect(client()).toBe('g@h.io');
  });

  it('logout clears client and token', async () => {
    renderWithProviders(<Probe />);
    await act(() => ctx.login('ada@example.com', 'password123'));
    await act(() => ctx.logout());
    expect(client()).toBe('none');
    expect(getToken()).toBeNull();
  });

  it('logout still signs out locally when the API fails', async () => {
    renderWithProviders(<Probe />);
    await act(() => ctx.login('ada@example.com', 'password123'));
    server.use(http.post(`${API}/client/logout`, () => HttpResponse.error()));
    await act(() => ctx.logout());
    expect(client()).toBe('none');
    expect(getToken()).toBeNull();
  });

  it('useAuth throws outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/within AuthProvider/);
    spy.mockRestore();
  });

  it('renders children', () => {
    render(
      <AuthProvider>
        <p>child</p>
      </AuthProvider>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
