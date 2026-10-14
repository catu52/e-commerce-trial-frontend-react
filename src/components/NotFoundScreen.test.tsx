import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import NotFoundScreen from './NotFoundScreen';

describe('NotFoundScreen', () => {
  it('renders 404, links, and noindex robots', () => {
    render(
      <MemoryRouter>
        <NotFoundScreen />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /shop/i })).toHaveAttribute('href', '/shop');
    expect(document.title).toBe('Page not found — KRAFT Studio');
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex,nofollow');
  });
});
