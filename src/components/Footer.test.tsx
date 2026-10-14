import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { API } from '../test/handlers';
import { renderWithProviders, screen, waitFor, userEvent } from '../test/utils';
import { DEFAULT_SITE_SETTINGS } from '../data/defaultContent';
import { Footer } from './Footer';

describe('Footer content', () => {
  it('renders Laravel tagline, social links and store locations', async () => {
    const onShowToast = vi.fn();
    renderWithProviders(<Footer currency="EUR" onShowToast={onShowToast} />);
    expect(await screen.findByText('LARAVEL FOOTER TAGLINE')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'MASTODON' });
    expect(link).toHaveAttribute('href', 'https://mastodon.example/kraft');
    expect(screen.queryByText('INSTAGRAM')).not.toBeInTheDocument();
    expect(screen.queryByText('BERLIN MITTE')).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'PARIS MARAIS' }));
    expect(onShowToast).toHaveBeenCalledWith('PARIS MARAIS: RUE DE BRETAGNE 1 [OPEN 10-19]');
  });

  it('falls back to defaults when the API returns 500', async () => {
    server.use(http.get(`${API}/content/site-settings`, () => HttpResponse.json({}, { status: 500 })));
    renderWithProviders(<Footer currency="EUR" onShowToast={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(DEFAULT_SITE_SETTINGS.footerTagline)).toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'INSTAGRAM' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'BERLIN MITTE' })).toBeInTheDocument();
  });
});
