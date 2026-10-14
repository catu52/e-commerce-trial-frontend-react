import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { API, makeProduct, products } from '../test/handlers';
import { renderWithProviders, screen, waitFor } from '../test/utils';
import { DEFAULT_HOME_CONTENT } from '../data/defaultContent';
import { HomeScreen } from './HomeScreen';

const manyProducts = [
  ...Array.from({ length: 6 }, (_, i) => makeProduct({ id: `f${i}`, slug: `filler-${i}`, title: `FILLER ${i}` })),
  makeProduct({ id: 't1', slug: 'trending-jacket', title: 'TRENDING JACKET' }),
];

const renderHome = () =>
  renderWithProviders(
    <HomeScreen
      products={manyProducts}
      onSelectProduct={vi.fn()}
      onAddToCart={vi.fn()}
      onNavigate={vi.fn()}
      onSelectSection={vi.fn()}
      onOpenCart={vi.fn()}
      currency="EUR"
      onShowToast={vi.fn()}
    />,
  );

describe('HomeScreen content', () => {
  it('renders hero, lookbook and editorial from the API', async () => {
    renderHome();
    expect(await screen.findByText('LARAVEL EYEBROW')).toBeInTheDocument();
    expect(screen.getByText('LARAVEL hero subtitle.')).toBeInTheDocument();
    expect(screen.getByText('LARAVEL LOOK ONE')).toBeInTheDocument();
    expect(screen.getByText('LARAVEL CAPTION')).toBeInTheDocument();
    expect(screen.getByLabelText('LARAVEL LOOK ONE')).toHaveStyle({ backgroundImage: `url('https://cdn.test/look1.jpg')` });
    expect(screen.getByText('LARAVEL EDITORIAL TITLE')).toBeInTheDocument();
    expect(screen.getByText('LARAVEL editorial body.')).toBeInTheDocument();
    expect(document.querySelector(`img[src="https://cdn.test/editorial.jpg"]`)).not.toBeNull();
  });

  it('falls back to default content when the API fails', async () => {
    server.use(http.get(`${API}/content/home`, () => HttpResponse.json({}, { status: 500 })));
    renderHome();
    await waitFor(() => expect(screen.getByText('LARAVEL ANNOUNCEMENT')).toBeInTheDocument());
    expect(screen.getByText(DEFAULT_HOME_CONTENT.heroEyebrow)).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_HOME_CONTENT.lookbook[0].title)).toBeInTheDocument();
    expect(screen.queryByText('LARAVEL EYEBROW')).not.toBeInTheDocument();
  });

  it('renders real links for products, sections and catalog, one h1, lazy images', async () => {
    renderHome();
    await screen.findByText('LARAVEL EYEBROW');
    const card = screen.getByRole('link', { name: /TRENDING JACKET/ });
    expect(card).toHaveAttribute('href', '/products/trending-jacket');
    expect(screen.getByRole('link', { name: /SHOP women/i })).toHaveAttribute('href', '/shop/women');
    expect(screen.getByRole('link', { name: /SHOP men/i })).toHaveAttribute('href', '/shop/men');
    expect(screen.getByRole('link', { name: /EXPLORE CAPSULE/ })).toHaveAttribute('href', '/shop');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByAltText('TRENDING JACKET')).toHaveAttribute('loading', 'lazy');
  });

  it.each([
    ['https://example.com/lookbook', 'https://example.com/lookbook'],
    ['/editorial/summer', '/editorial/summer'],
    ['/catalog', '/shop'],
  ])('points the lookbook tile at the CMS link %s', async (link, href) => {
    const { homeFixture } = await import('../test/handlers');
    const look = homeFixture.data.lookbook[0];
    server.use(http.get(`${API}/content/home`, () =>
      HttpResponse.json({ ...homeFixture, data: { ...homeFixture.data, lookbook: [{ ...look, link }] } })));
    renderHome();
    const tile = (await screen.findByText('LARAVEL LOOK ONE')).closest('a');
    expect(tile).toHaveAttribute('href', href);
  });
});
