import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { API } from '../test/handlers';
import { renderHook, waitFor } from '../test/utils';
import { DEFAULT_SITE_CONTENT } from '../data/defaultContent';
import { useSiteContent } from './useSiteContent';

const count = () => {
  const c = { home: 0, settings: 0 };
  server.use(
    http.get(`${API}/content/home`, () => {
      c.home++;
      return HttpResponse.json({ data: { heroTitle: 'COUNTED' } });
    }),
    http.get(`${API}/content/site-settings`, () => {
      c.settings++;
      return HttpResponse.json({ data: { announcement: 'COUNTED A' } });
    }),
  );
  return c;
};

describe('useSiteContent', () => {
  it('starts loading with defaults, then loads content', async () => {
    const { result } = renderHook(() => useSiteContent());
    expect(result.current.loading).toBe(true);
    expect(result.current.content).toEqual(DEFAULT_SITE_CONTENT);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.content.home.heroEyebrow).toBe('LARAVEL EYEBROW');
    expect(result.current.content.settings.announcement).toBe('LARAVEL ANNOUNCEMENT');
  });

  it('shares one fetch across consumers and later mounts', async () => {
    const c = count();
    const a = renderHook(() => useSiteContent());
    const b = renderHook(() => useSiteContent());
    await waitFor(() => expect(a.result.current.loading).toBe(false));
    await waitFor(() => expect(b.result.current.loading).toBe(false));
    const late = renderHook(() => useSiteContent());
    expect(late.result.current.content.home.heroTitle).toBe('COUNTED');
    expect(c).toEqual({ home: 1, settings: 1 });
  });

  it('keeps settings when only home fails', async () => {
    server.use(http.get(`${API}/content/home`, () => HttpResponse.json({}, { status: 500 })));
    const { result } = renderHook(() => useSiteContent());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/unavailable/i);
    expect(result.current.content.home).toEqual(DEFAULT_SITE_CONTENT.home);
    expect(result.current.content.settings.announcement).toBe('LARAVEL ANNOUNCEMENT');
  });

  it('keeps home when only settings fails', async () => {
    server.use(http.get(`${API}/content/site-settings`, () => HttpResponse.error()));
    const { result } = renderHook(() => useSiteContent());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();
    expect(result.current.content.home.heroEyebrow).toBe('LARAVEL EYEBROW');
    expect(result.current.content.settings).toEqual(DEFAULT_SITE_CONTENT.settings);
  });

  it('uses defaults and reports error when both fail', async () => {
    server.use(
      http.get(`${API}/content/home`, () => HttpResponse.json({}, { status: 500 })),
      http.get(`${API}/content/site-settings`, () => HttpResponse.json({}, { status: 500 })),
    );
    const { result } = renderHook(() => useSiteContent());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();
    expect(result.current.content).toEqual(DEFAULT_SITE_CONTENT);
  });
});
