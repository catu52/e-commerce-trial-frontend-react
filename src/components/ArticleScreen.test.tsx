import { renderWithProviders, screen, within } from '../test/utils';
import { ArticleScreen } from './ArticleScreen';

const renderArticle = (slug = 'on-raw-denim') => renderWithProviders(<ArticleScreen slug={slug} />, { route: `/editorial/${slug}` });

describe('ArticleScreen', () => {
  it('renders one h1, cover, meta and breadcrumb', async () => {
    renderArticle();
    expect(await screen.findByRole('heading', { level: 1, name: 'ON RAW DENIM' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getAllByAltText('Folded raw denim')[0]).toBeInTheDocument();
    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(crumbs).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(within(crumbs).getByRole('link', { name: 'Editorial' })).toHaveAttribute('href', '/editorial');
    expect(screen.getByRole('link', { name: /Back to editorial/ })).toHaveAttribute('href', '/editorial');
  });

  it('renders markdown headings, lists, quotes and links safely', async () => {
    const { container } = renderArticle();
    expect(await screen.findByRole('heading', { level: 2, name: 'Materials' })).toBeInTheDocument();
    // a markdown "# " must not create a second h1
    expect(screen.getByRole('heading', { level: 2, name: 'Body Title' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(expect.arrayContaining(['Cotton', 'Wool']));
    expect(container.querySelector('blockquote')).toHaveTextContent('A quote');
    const ext = screen.getByRole('link', { name: 'external link' });
    expect(ext).toHaveAttribute('rel', 'noopener noreferrer');
    expect(ext).toHaveAttribute('target', '_blank');
    const internal = screen.getByRole('link', { name: 'internal link' });
    expect(internal).toHaveAttribute('href', '/shop');
    expect(internal).not.toHaveAttribute('target');
  });

  it('does not render raw HTML or scripts from the body', async () => {
    const { container } = renderArticle();
    await screen.findByRole('heading', { level: 2, name: 'Materials' });
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('.raw-html')).toBeNull();
    expect((window as unknown as Record<string, unknown>).__pwned).toBeUndefined();
  });

  it('lists related articles under an h2', async () => {
    renderArticle();
    expect(await screen.findByRole('heading', { level: 2, name: 'Related articles' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /THE RAIL SYSTEM/ })).toHaveAttribute('href', '/editorial/the-rail-system');
  });

  it('sets article SEO and JSON-LD', async () => {
    renderArticle();
    await screen.findByRole('heading', { level: 1 });
    expect(document.head.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'article');
    expect(document.head.querySelector('meta[property="og:image"]')).toHaveAttribute('content', 'https://cdn.test/denim.jpg');
    const ld = JSON.parse(document.head.querySelector('script[data-seo]')!.textContent!);
    expect(ld.map((x: { '@type': string }) => x['@type'])).toEqual(['Article', 'BreadcrumbList']);
  });

  it('renders the 404 page for unknown slugs', async () => {
    renderArticle('missing');
    expect(await screen.findByRole('heading', { level: 1, name: '404' })).toBeInTheDocument();
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  });

  it('shows a preview banner and noindex when opened with a valid signed link', async () => {
    renderWithProviders(<ArticleScreen slug="on-raw-denim" />, {
      route: '/editorial/on-raw-denim?preview=1&expires=9999999999&signature=valid-sig',
    });
    expect(await screen.findByText(/preview mode · draft/i)).toBeInTheDocument();
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  });

  it('shows an unavailable message when the preview signature is rejected', async () => {
    renderWithProviders(<ArticleScreen slug="on-raw-denim" />, {
      route: '/editorial/on-raw-denim?preview=1&expires=1&signature=bad',
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(/article unavailable/i);
  });

  it('does not show the banner for normal visits', async () => {
    renderArticle();
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByText(/preview mode/i)).not.toBeInTheDocument();
  });
});
