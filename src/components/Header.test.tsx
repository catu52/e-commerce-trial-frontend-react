import { http, HttpResponse } from 'msw';
import { act, screen, waitFor, within } from '@testing-library/react';
import { server } from '../test/server';
import { API, TEST_TOKEN } from '../test/handlers';
import { loginAsTestClient, renderWithProviders } from '../test/utils';
import { getToken } from '../lib/api';
import { Header } from './Header';

const setup = (props: Partial<React.ComponentProps<typeof Header>> = {}) => {
  const handlers = {
    onSelectSection: vi.fn(),
    onNavigate: vi.fn(),
    onOpenCart: vi.fn(),
    onCurrencyChange: vi.fn(),
    onOpenAuth: vi.fn(),
  };
  const utils = renderWithProviders(
    <Header currentPage="home" cartCount={3} currency="EUR" {...handlers} {...props} />,
  );
  return { ...handlers, ...utils };
};

describe('Header (storefront)', () => {
  it('shows the cart count and opens the cart', async () => {
    const { user, onOpenCart } = setup({ cartCount: 7 });
    const btn = screen.getByRole('button', { name: 'Open Cart' });
    expect(btn).toHaveTextContent('BAG [7]');
    await user.click(btn);
    expect(onOpenCart).toHaveBeenCalled();
  });

  it('links sections to real anchors: new arrivals / women / men', () => {
    setup();
    expect(screen.getByRole('link', { name: 'Women' })).toHaveAttribute('href', '/shop/women');
    expect(screen.getByRole('link', { name: 'Men' })).toHaveAttribute('href', '/shop/men');
    expect(screen.getByRole('link', { name: 'New Arrivals' })).toHaveAttribute('href', '/shop');
  });

  it('wraps the primary navigation in a labelled nav', () => {
    setup();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });

  it('highlights the active section only on the catalog page', () => {
    const { unmount } = setup({ currentPage: 'catalog', section: 'women' });
    expect(screen.getByRole('link', { name: 'Women' }).className).toMatch(/font-bold/);
    expect(screen.getByRole('link', { name: 'Men' }).className).not.toMatch(/font-bold/);
    unmount();
    setup({ currentPage: 'home', section: 'women' });
    expect(screen.getByRole('link', { name: 'Women' }).className).not.toMatch(/font-bold/);
  });

  it('links the logo to home and New Arrivals to the catalog', () => {
    setup({ currentPage: 'catalog' });
    expect(screen.getByRole('link', { name: /KRAFT/ })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'New Arrivals' })).toHaveAttribute('href', '/shop');
  });

  it('Sale links to /sale and is highlighted on the sale page', () => {
    const { unmount } = setup();
    expect(screen.getByRole('link', { name: /Sale/ })).toHaveAttribute('href', '/sale');
    expect(screen.getByRole('link', { name: /Sale/ })).not.toHaveAttribute('aria-current');
    unmount();
    setup({ currentPage: 'sale' });
    expect(screen.getByRole('link', { name: /Sale/ })).toHaveAttribute('aria-current', 'page');
  });

  it('Editorial is a real link to /editorial, highlighted on editorial pages', () => {
    setup();
    const link = screen.getByRole('link', { name: 'Editorial' });
    expect(link).toHaveAttribute('href', '/editorial');
    expect(link).not.toHaveAttribute('aria-current');
  });

  it.each(['editorial', 'article'] as const)('Editorial is highlighted on the %s page', (currentPage) => {
    setup({ currentPage });
    expect(screen.getByRole('link', { name: 'Editorial' })).toHaveAttribute('aria-current', 'page');
  });

  it('emits currency changes', async () => {
    const { user, onCurrencyChange } = setup();
    await user.selectOptions(screen.getByLabelText('Currency Selector'), 'JPY');
    expect(onCurrencyChange).toHaveBeenCalledWith('JPY');
  });

  it('search is an icon-only button that opens search, or submits the current query', async () => {
    const onOpenSearch = vi.fn();
    const first = setup({ onOpenSearch });
    expect(screen.queryByPlaceholderText('SEARCH INDEX...')).not.toBeInTheDocument();
    await first.user.click(screen.getByRole('button', { name: 'Search' }));
    expect(onOpenSearch).toHaveBeenCalled();
    first.unmount();

    const onSearchSubmit = vi.fn();
    const second = setup({ searchQuery: 'denim', onSearchSubmit });
    await second.user.click(screen.getByRole('button', { name: 'Search' }));
    expect(onSearchSubmit).toHaveBeenCalledWith('denim');
  });

  it('hamburger toggles a mobile menu with the nav links', async () => {
    const { user } = setup();
    expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    const nav = screen.getByRole('navigation', { name: 'Mobile' });
    expect(within(nav).getByRole('link', { name: 'Editorial' })).toHaveAttribute('href', '/editorial');
    await user.click(within(nav).getByRole('link', { name: 'Editorial' }));
    expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument();
  });

  it('includes the theme toggle', () => {
    setup();
    expect(screen.getByRole('button', { name: /^Theme:/ })).toBeInTheDocument();
  });

  describe('account', () => {
    it('shows LOG IN when logged out and calls onOpenAuth', async () => {
      const { user, onOpenAuth } = setup();
      await user.click(screen.getByRole('button', { name: /LOG IN/ }));
      expect(onOpenAuth).toHaveBeenCalled();
    });

    it('shows the client name when logged in, and LOG OUT signs out', async () => {
      loginAsTestClient();
      const { user } = setup();
      expect(await screen.findByText('Ada Lovelace')).toHaveAttribute('title', 'ada@example.com');
      expect(screen.queryByRole('button', { name: /LOG IN/ })).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'LOG OUT' }));
      await waitFor(() => expect(screen.getByRole('button', { name: /LOG IN/ })).toBeInTheDocument());
      expect(getToken()).toBeNull();
    });

    it('stays logged out when the stored token is rejected', async () => {
      localStorage.setItem('kraft.authToken', 'bad');
      setup();
      await waitFor(() => expect(getToken()).toBeNull());
      expect(screen.getByRole('button', { name: /LOG IN/ })).toBeInTheDocument();
      expect(TEST_TOKEN).not.toBe('bad');
    });
  });

  describe('flash clearance pill', () => {
    it('appears with a countdown when a sale is ending and links to flash-sale', async () => {
      setup();
      const pill = await screen.findByRole('link', { name: /Flash Clearance/ });
      expect(pill).toHaveTextContent(/0[56]:\d\d:\d\d/);
      expect(pill).toHaveAttribute('href', '/flash-sale');
    });

    it('is hidden when there is no upcoming end time', async () => {
      let called = false;
      server.use(
        http.get(`${API}/catalog/flash-sales`, () => {
          called = true;
          return HttpResponse.json({ data: [], meta: { nextEndsAt: null, serverTime: '2030-01-01T00:00:00Z' } });
        }),
      );
      setup();
      await waitFor(() => expect(called).toBe(true));
      await act(async () => {});
      expect(screen.queryByRole('link', { name: /Flash Clearance/ })).not.toBeInTheDocument();
    });

    it('is hidden when the flash API fails', async () => {
      let called = false;
      server.use(
        http.get(`${API}/catalog/flash-sales`, () => {
          called = true;
          return HttpResponse.json({ message: 'x' }, { status: 500 });
        }),
      );
      setup();
      await waitFor(() => expect(called).toBe(true));
      await act(async () => {});
      expect(screen.queryByRole('link', { name: /Flash Clearance/ })).not.toBeInTheDocument();
    });
  });
});

describe('Header (checkout)', () => {
  it('renders the checkout variant with step links and no catalog nav', async () => {
    const { user, onOpenCart } = setup({ currentPage: 'checkout-2' });
    expect(screen.queryByRole('link', { name: 'Women' })).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Checkout steps' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '01 Information' })).toHaveAttribute('href', '/checkout/information');
    expect(screen.getByRole('link', { name: '02 Payment & Review' })).toHaveAttribute('href', '/checkout/payment');
    expect(screen.getByRole('link', { name: '03 Confirmation' })).toHaveAttribute('href', '/checkout/confirmation');
    expect(screen.getByRole('link', { name: /KRAFT/ })).toHaveAttribute('href', '/');
    await user.click(screen.getByRole('button', { name: /RETURN TO BAG/ }));
    expect(onOpenCart).toHaveBeenCalled();
    expect(screen.getByText('[3]')).toBeInTheDocument();
  });

  it('marks the current step', () => {
    setup({ currentPage: 'checkout-2' });
    expect(screen.getByRole('link', { name: '02 Payment & Review' }).className).toMatch(/font-bold/);
    expect(screen.getByRole('link', { name: '01 Information' }).className).not.toMatch(/font-bold/);
  });
});
