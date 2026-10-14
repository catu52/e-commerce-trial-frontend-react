import { http, HttpResponse } from 'msw';
import { useLocation } from 'react-router-dom';
import { server } from '../test/server';
import { API } from '../test/handlers';
import { renderWithProviders, screen, waitFor, within } from '../test/utils';
import { EditorialScreen } from './EditorialScreen';

function Probe() {
  const { pathname, search } = useLocation();
  return <div data-testid="loc">{pathname + search}</div>;
}
const renderList = (route = '/editorial') =>
  renderWithProviders(
    <>
      <EditorialScreen />
      <Probe />
    </>,
    { route },
  );

describe('EditorialScreen', () => {
  it('renders one h1, the featured hero first and cards as single links', async () => {
    renderList();
    expect(screen.getByRole('heading', { level: 1, name: 'Editorial' })).toBeInTheDocument();
    const hero = await screen.findByRole('link', { name: /THE RAIL SYSTEM/ });
    expect(hero).toHaveAttribute('href', '/editorial/the-rail-system');
    expect(screen.getAllByRole('article')[0]).toContainElement(hero);
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const card = screen.getByRole('link', { name: /ON RAW DENIM/ });
    expect(within(card).getByRole('img', { name: 'Folded raw denim' })).toHaveAttribute('loading', 'lazy');
    expect(within(card).getByText('4 min read')).toBeInTheDocument();
    expect(card.querySelector('time')).toHaveAttribute('datetime', '2026-03-04T10:00:00Z');
  });

  it('shows a placeholder when there is no cover', async () => {
    renderList();
    const card = await screen.findByRole('link', { name: /NO COVER STORY/ });
    expect(within(card).getByTestId('cover-placeholder')).toBeInTheDocument();
    expect(within(card).queryByRole('img')).toBeNull();
  });

  it('category chip updates the URL and refetches; ALL resets', async () => {
    const { user } = renderList('/editorial?page=2');
    await screen.findByRole('link', { name: /ON RAW DENIM/ });
    await user.click(screen.getByRole('button', { name: 'Interview' }));
    expect(screen.getByTestId('loc')).toHaveTextContent('/editorial?category=Interview');
    await waitFor(() => expect(screen.queryByRole('link', { name: /ON RAW DENIM/ })).toBeNull());
    expect(screen.getByRole('link', { name: /THE RAIL SYSTEM/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ALL' }));
    expect(screen.getByTestId('loc')).toHaveTextContent(/^\/editorial$/);
    expect(await screen.findByRole('link', { name: /ON RAW DENIM/ })).toBeInTheDocument();
  });

  it('paginates through the query string', async () => {
    server.use(
      http.get(`${API}/content/articles`, ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page') ?? 1);
        return HttpResponse.json({
          data: [{ id: page, slug: `p${page}`, title: `PAGE ${page} ARTICLE`, readingMinutes: 1 }],
          meta: { current_page: page, last_page: 3, per_page: 9, total: 3 },
          categories: [],
        });
      }),
    );
    const { user } = renderList();
    await screen.findByText('PAGE 1 ARTICLE');
    expect(screen.getByText('PAGE 1 / 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /PREV/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /NEXT/ }));
    expect(screen.getByTestId('loc')).toHaveTextContent('/editorial?page=2');
    await screen.findByText('PAGE 2 ARTICLE');
    expect(screen.getByRole('button', { name: /PREV/ })).toBeEnabled();
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toMatch(/\/editorial$/);
  });

  it('shows the empty state', async () => {
    server.use(http.get(`${API}/content/articles`, () => HttpResponse.json({ data: [], meta: {}, categories: [] })));
    renderList();
    expect(await screen.findByText(/NO ARTICLES PUBLISHED YET/)).toBeInTheDocument();
  });

  it('shows an error and retries', async () => {
    server.use(http.get(`${API}/content/articles`, () => HttpResponse.json({ message: 'boom' }, { status: 500 }), { once: true }));
    const { user } = renderList();
    expect(await screen.findByRole('alert')).toHaveTextContent('boom');
    await user.click(screen.getByRole('button', { name: 'RETRY' }));
    expect(await screen.findByRole('link', { name: /ON RAW DENIM/ })).toBeInTheDocument();
  });
});
