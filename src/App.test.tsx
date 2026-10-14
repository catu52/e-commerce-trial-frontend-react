import { http, HttpResponse } from 'msw';
import { server } from './test/server';
import { API } from './test/handlers';
import { renderWithProviders, screen, waitFor } from './test/utils';
import { DEFAULT_SITE_SETTINGS } from './data/defaultContent';
import App from './App';

describe('App announcement', () => {
  it('shows the Laravel announcement in the top bar', async () => {
    renderWithProviders(<App />);
    expect((await screen.findAllByText('LARAVEL ANNOUNCEMENT')).length).toBeGreaterThan(0);
  });

  it('shows the default announcement when the API fails', async () => {
    server.use(http.get(`${API}/content/site-settings`, () => HttpResponse.json({}, { status: 500 })));
    renderWithProviders(<App />);
    await waitFor(() =>
      expect(screen.getAllByText(DEFAULT_SITE_SETTINGS.announcement).length).toBeGreaterThan(0),
    );
    expect(screen.queryByText('LARAVEL ANNOUNCEMENT')).not.toBeInTheDocument();
  });
});
