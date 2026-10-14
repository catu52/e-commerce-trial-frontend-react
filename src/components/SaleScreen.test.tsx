import { http, HttpResponse } from 'msw';
import { Route, Routes, useLocation } from 'react-router-dom';
import { screen, within, waitFor } from '@testing-library/react';
import { server } from '../test/server';
import { API, makeProduct } from '../test/handlers';
import { renderWithProviders } from '../test/utils';
import { SaleScreen } from './SaleScreen';
import { SalePrice, SaleBadge } from './SalePrice';

function Probe() {
  const l = useLocation();
  return <div data-testid="loc">{l.pathname + l.search}</div>;
}

const renderSale = (route = '/sale') =>
  renderWithProviders(
    <>
      <Routes>
        <Route path="/sale" element={<SaleScreen currency="EUR" />} />
      </Routes>
      <Probe />
    </>,
    { route },
  );

describe('SaleScreen', () => {
  it('renders headline, cards with badge, strike price and PDP links, plus SEO', async () => {
    renderSale();
    expect(await screen.findByRole('heading', { level: 1, name: 'Up to 50% off' })).toBeInTheDocument();
    const link = screen.getAllByRole('link', { name: /SALE PARKA/ })[0];
    expect(link).toHaveAttribute('href', '/products/sale-parka');
    const card = link.closest('article') as HTMLElement;
    expect(within(card).getByText('-40%')).toBeInTheDocument();
    expect(within(card).getByText('€150.00')).toBeInTheDocument();
    expect(within(card).getByTestId('compare-at-price')).toHaveTextContent('€250.00');
    expect(document.title).toContain('Sale');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toMatch(/\/sale$/);
    await waitFor(() => expect(document.head.querySelector('script[data-seo]')?.textContent).toContain('ItemList'));
  });

  it('sorts by biggest discount by default and supports price sorting via URL', async () => {
    renderSale();
    await screen.findByText('SALE PARKA');
    const titles = () => screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles()).toEqual(['SALE BOOTS', 'SALE PARKA', 'SALE TEE']);
  });

  it('sorts by price ascending from the URL', async () => {
    renderSale('/sale?sort=price-asc');
    await screen.findByText('SALE PARKA');
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['SALE TEE', 'SALE BOOTS', 'SALE PARKA']);
    expect(screen.getByLabelText('Sort sale products')).toHaveValue('price-asc');
  });

  it('only renders tiers up to max discount and filters via URL state', async () => {
    const { user } = renderSale();
    await screen.findByText('SALE PARKA');
    const group = screen.getByRole('group', { name: 'Discount filter' });
    expect(within(group).getAllByRole('button').map((b) => b.textContent)).toEqual([
      'All sale', '20%+ off', '30%+ off', '40%+ off', '50%+ off',
    ]);
    await user.click(within(group).getByRole('button', { name: '40%+ off' }));
    await waitFor(() => expect(screen.queryByText('SALE TEE')).not.toBeInTheDocument());
    expect(screen.getByTestId('loc')).toHaveTextContent('/sale?min_discount=40');
    expect(screen.getByRole('button', { name: '40%+ off' })).toHaveAttribute('aria-pressed', 'true');
    await user.selectOptions(screen.getByLabelText('Sort sale products'), 'price-desc');
    expect(screen.getByTestId('loc')).toHaveTextContent('min_discount=40&sort=price-desc');
    await user.click(screen.getByRole('button', { name: 'All sale' }));
    expect(await screen.findByText('SALE TEE')).toBeInTheDocument();
    expect(screen.getByTestId('loc')).toHaveTextContent('/sale?sort=price-desc');
  });

  it('restores filter from the URL on load', async () => {
    renderSale('/sale?min_discount=50');
    expect(await screen.findByText('SALE BOOTS')).toBeInTheDocument();
    expect(screen.queryByText('SALE PARKA')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '50%+ off' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('hides tiers above max discount', async () => {
    server.use(
      http.get(`${API}/catalog/products`, () =>
        HttpResponse.json({ data: [makeProduct({ onSale: true, discountPercent: 25, compareAtPriceEUR: 300, priceEUR: 225 })], meta: { total: 1, max_discount: 25 } }),
      ),
    );
    renderSale();
    expect(await screen.findByRole('heading', { level: 1, name: 'Up to 25% off' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '20%+ off' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '30%+ off' })).not.toBeInTheDocument();
  });

  it('shows the empty state', async () => {
    server.use(http.get(`${API}/catalog/products`, () => HttpResponse.json({ data: [], meta: { total: 0, max_discount: null } })));
    renderSale();
    expect(await screen.findByText(/No sale products match/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Sale' })).toBeInTheDocument();
  });

  it('shows loading then an error with retry', async () => {
    let fail = true;
    server.use(
      http.get(`${API}/catalog/products`, () =>
        fail ? HttpResponse.json({ message: 'Boom' }, { status: 500 }) : HttpResponse.json({ data: [], meta: { total: 0, max_discount: null } }),
      ),
    );
    const { user } = renderSale();
    expect(screen.getByRole('status')).toHaveTextContent(/Loading/);
    expect(await screen.findByRole('alert')).toHaveTextContent(/Boom/);
    fail = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText(/No sale products match/)).toBeInTheDocument();
  });
});

describe('SalePrice / SaleBadge', () => {
  it('shows plain price and no badge when not discounted', () => {
    const p = makeProduct({ priceEUR: 100, onSale: false });
    renderWithProviders(<><SalePrice product={p} currency="EUR" /><SaleBadge product={p} /></>);
    expect(screen.getByText('€100.00')).toBeInTheDocument();
    expect(screen.queryByTestId('compare-at-price')).not.toBeInTheDocument();
    expect(screen.queryByText(/^-\d+%$/)).not.toBeInTheDocument();
  });
});
