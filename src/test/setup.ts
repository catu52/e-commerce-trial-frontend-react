import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { server } from './server';
import { mockMatchMedia } from './matchMedia';
import { resetSiteContentCache } from '../hooks/useSiteContent';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  mockMatchMedia(false);
});

afterEach(() => {
  cleanup();
  resetSiteContentCache();
  server.resetHandlers();
  vi.useRealTimers();
});

afterAll(() => server.close());
