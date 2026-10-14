import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { setToken, type ApiError } from '../lib/api';
import { TEST_TOKEN } from './handlers';

const makeProviders = (route: string) =>
  function AllProviders({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

/** Renders with ThemeProvider + AuthProvider and returns a ready `user` (userEvent) instance. */
export function renderWithProviders(ui: ReactElement, options: Omit<RenderOptions, 'wrapper'> & { route?: string } = {}) {
  const { route = '/', ...rest } = options;
  return { user: userEvent.setup(), ...render(ui, { wrapper: makeProviders(route), ...rest }) };
}

/** Stores the token the default MSW handlers accept, so AuthProvider hydrates via /client/me. */
export const loginAsTestClient = () => setToken(TEST_TOKEN);

/** Awaits a promise that must reject and returns the error typed as ApiError. */
export async function rejection(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (e) {
    return e as ApiError;
  }
  throw new Error('Expected the promise to reject');
}

export { render, screen, waitFor, within, act, renderHook } from '@testing-library/react';
export { userEvent };
