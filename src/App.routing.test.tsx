import { http, HttpResponse } from 'msw';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from './test/server';
import { API, makeProduct, products } from './test/handlers';
import { renderWithProviders, screen, waitFor } from './test/utils';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { STORAGE_KEYS } from './config';
import type { CartItem } from './types';
import App from './App';

function LocationProbe() {
  const { pathname } = useLocation();
  return <div data-testid="location">{pathname}</div>;
}

function renderApp(route: string) {
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <ThemeProvider>
          <AuthProvider>
            <App />
            <LocationProbe />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>,
    ),
  };
}

const path = () => screen.getByTestId('location').textContent;

const cartItem = (): CartItem => ({
  id: 'c1',
  productId: products[0].id,
  title: products[0].title,
  image: products[0].image,
  priceEUR: products[0].priceEUR,
  sku: products[0].sku,
  size: 'M',
  color: 'CARBON BLACK',
  quantity: 1,
} as CartItem);

const seedCart = () => localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify([cartItem()]));

describe('App routing / deep links', () => {
  beforeEach(() => localStorage.clear());

  it('/ shows home', async () => {
    renderWithProviders(<App />, { route: '/' });
    expect(await screen.findByText(/LARAVEL HERO/)).toBeInTheDocument();
  });

  it('/shop shows the catalog', async () => {
    renderWithProviders(<App />, { route: '/shop' });
    expect(await screen.findByRole('heading', { level: 1, name: /NEW ARRIVALS/ })).toBeInTheDocument();
  });

  it('/shop/women requests gender=women and highlights the section', async () => {
    const genders: (string | null)[] = [];
    server.use(
      http.get(`${API}/catalog/products`, ({ request }) => {
        const gender = new URL(request.url).searchParams.get('gender');
        genders.push(gender);
        const data = products.filter((p) => !gender || p.gender === gender);
        return HttpResponse.json({ data, meta: { current_page: 1, last_page: 1, per_page: 100, total: data.length } });
      }),
    );
    renderWithProviders(<App />, { route: '/shop/women' });
    expect(await screen.findByRole('heading', { level: 1, name: /WOMEN/ })).toBeInTheDocument();
    expect(genders).toContain('women');
    const link = screen.getAllByRole('link', { name: 'Women' })[0];
    expect(link.className).toMatch(/font-bold/);
  });

  it('/products/<slug> shows that PDP directly, not the landing page', async () => {
    renderWithProviders(<App />, { route: '/products/wool-coat' });
    expect(await screen.findByRole('heading', { level: 1, name: /WOOL COAT/ })).toBeInTheDocument();
    expect(screen.queryByText(/LARAVEL HERO/)).not.toBeInTheDocument();
  });

  it('/products/<encoded slug> resolves', async () => {
    server.use(
      http.get(`${API}/catalog/products/:slug`, ({ params }) =>
        params.slug === 'odd slug €'
          ? HttpResponse.json({ data: makeProduct({ id: '99', slug: 'odd slug €', title: 'ODD ITEM' }) })
          : HttpResponse.json({ message: 'Not found.' }, { status: 404 }),
      ),
    );
    renderWithProviders(<App />, { route: '/products/odd%20slug%20%E2%82%AC' });
    expect(await screen.findByRole('heading', { level: 1, name: /ODD ITEM/ })).toBeInTheDocument();
  });

  it('a product outside the loaded section list still resolves via the API', async () => {
    server.use(
      http.get(`${API}/catalog/products/:slug`, ({ params }) =>
        HttpResponse.json({ data: makeProduct({ id: '42', slug: String(params.slug), title: 'HIDDEN GEM', gender: 'men' }) }),
      ),
    );
    renderWithProviders(<App />, { route: '/products/hidden-gem' });
    expect(await screen.findByRole('heading', { level: 1, name: /HIDDEN GEM/ })).toBeInTheDocument();
  });

  it('/products/does-not-exist shows the 404 screen', async () => {
    renderWithProviders(<App />, { route: '/products/does-not-exist' });
    expect(await screen.findByRole('heading', { name: '404' })).toBeInTheDocument();
  });

  it('a product API failure shows the unavailable message, not 404', async () => {
    server.use(http.get(`${API}/catalog/products/:slug`, () => HttpResponse.json({ message: 'boom' }, { status: 500 })));
    renderWithProviders(<App />, { route: '/products/whatever' });
    expect(await screen.findByText(/SPECIMEN UNAVAILABLE/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '404' })).not.toBeInTheDocument();
  });

  it('/nonsense shows 404 without Header/Footer', async () => {
    renderWithProviders(<App />, { route: '/nonsense' });
    expect(await screen.findByRole('heading', { name: '404' })).toBeInTheDocument();
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument();
  });

  it('/shop/kids shows 404', async () => {
    renderWithProviders(<App />, { route: '/shop/kids' });
    expect(await screen.findByRole('heading', { name: '404' })).toBeInTheDocument();
  });

  it('/flash-sale renders the flash sale', async () => {
    renderWithProviders(<App />, { route: '/flash-sale' });
    expect(await screen.findByRole('heading', { level: 1, name: /ARCHIVE PROTOCOL/ })).toBeInTheDocument();
  });

  it('/sale renders the sale page, not the flash sale', async () => {
    renderWithProviders(<App />, { route: '/sale' });
    expect(await screen.findByRole('heading', { level: 1, name: 'Up to 50% off' })).toBeInTheDocument();
  });

  describe('checkout guards', () => {
    it.each(['/checkout/information', '/checkout/payment'])('%s with an empty cart redirects to /shop', async (route) => {
      renderApp(route);
      await waitFor(() => expect(path()).toBe('/shop'));
      expect(await screen.findByRole('heading', { level: 1, name: /NEW ARRIVALS/ })).toBeInTheDocument();
    });

    it('/checkout/confirmation without an order redirects home', async () => {
      renderApp('/checkout/confirmation');
      await waitFor(() => expect(path()).toBe('/'));
      expect(await screen.findByText(/LARAVEL HERO/)).toBeInTheDocument();
    });

    it('/checkout/information with items renders step 1', async () => {
      seedCart();
      renderApp('/checkout/information');
      expect(await screen.findByText(/PROTOCOL CHECKOUT GATEWAY/)).toBeInTheDocument();
      expect(path()).toBe('/checkout/information');
    });
  });

  describe('navigation updates the URL', () => {
    it('clicking a product card goes to /products/<slug>', async () => {
      const { user } = renderApp('/shop');
      await user.click((await screen.findAllByRole('link', { name: 'RAW DENIM JACKET' }))[0]);
      await waitFor(() => expect(path()).toBe('/products/raw-denim-jacket'));
      expect(await screen.findByRole('heading', { level: 1, name: /RAW DENIM JACKET/ })).toBeInTheDocument();
    });

    it('header Men goes to /shop/men', async () => {
      const { user } = renderApp('/shop');
      await screen.findByRole('heading', { level: 1, name: /NEW ARRIVALS/ });
      await user.click(screen.getAllByRole('link', { name: 'Men' })[0]);
      await waitFor(() => expect(path()).toBe('/shop/men'));
      expect(await screen.findByRole('heading', { level: 1, name: /MEN/ })).toBeInTheDocument();
    });
  });
});

describe('editorial routing', () => {
  it('deep-links /editorial?category=Essay to the list', async () => {
    renderApp('/editorial?category=Essay');
    expect(await screen.findByRole('heading', { level: 1, name: 'Editorial' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /ON RAW DENIM/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Editorial', current: 'page' })).toHaveAttribute('href', '/editorial');
  });

  it('deep-links /editorial/:slug to the article and navigates from a card', async () => {
    const { user } = renderApp('/editorial');
    await user.click(await screen.findByRole('link', { name: /ON RAW DENIM/ }));
    expect(path()).toBe('/editorial/on-raw-denim');
    expect(await screen.findByRole('heading', { level: 1, name: 'ON RAW DENIM' })).toBeInTheDocument();
  });

  it('renders the 404 screen for an unknown article', async () => {
    renderApp('/editorial/does-not-exist');
    expect(await screen.findByRole('heading', { level: 1, name: '404' })).toBeInTheDocument();
  });
});
