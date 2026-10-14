import { act, render, screen } from '@testing-library/react';
import { mockMatchMedia } from '../test/matchMedia';
import { renderWithProviders } from '../test/utils';
import { ThemeProvider, useTheme } from './ThemeContext';

const Probe = () => {
  const { preference, resolved, setPreference, cyclePreference } = useTheme();
  return (
    <div>
      <span data-testid="pref">{preference}</span>
      <span data-testid="resolved">{resolved}</span>
      <button onClick={cyclePreference}>cycle</button>
      <button onClick={() => setPreference('dark')}>dark</button>
    </div>
  );
};

const isDark = () => document.documentElement.classList.contains('dark');
const pref = () => screen.getByTestId('pref').textContent;
const resolved = () => screen.getByTestId('resolved').textContent;

describe('ThemeProvider', () => {
  it('defaults to system preference, resolving to light when OS is light', () => {
    renderWithProviders(<Probe />);
    expect(pref()).toBe('system');
    expect(resolved()).toBe('light');
    expect(isDark()).toBe(false);
  });

  it('resolves system to dark when OS prefers dark and applies the dark class', () => {
    mockMatchMedia(true);
    renderWithProviders(<Probe />);
    expect(pref()).toBe('system');
    expect(resolved()).toBe('dark');
    expect(isDark()).toBe(true);
  });

  it('queries prefers-color-scheme: dark', () => {
    const spy = vi.spyOn(window, 'matchMedia');
    renderWithProviders(<Probe />);
    expect(spy).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    spy.mockRestore();
  });

  it('reacts live to OS scheme changes while on system', () => {
    const media = mockMatchMedia(false);
    renderWithProviders(<Probe />);
    act(() => media.setMatches(true));
    expect(resolved()).toBe('dark');
    expect(isDark()).toBe(true);
    act(() => media.setMatches(false));
    expect(resolved()).toBe('light');
    expect(isDark()).toBe(false);
  });

  it('ignores OS changes once an explicit preference is chosen', async () => {
    const media = mockMatchMedia(false);
    const { user } = renderWithProviders(<Probe />);
    await user.click(screen.getByText('cycle')); // system -> light
    act(() => media.setMatches(true));
    expect(pref()).toBe('light');
    expect(resolved()).toBe('light');
    expect(isDark()).toBe(false);
  });

  it('cycles system -> light -> dark -> system', async () => {
    const { user } = renderWithProviders(<Probe />);
    const seen = [pref()];
    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByText('cycle'));
      seen.push(pref());
    }
    expect(seen).toEqual(['system', 'light', 'dark', 'system']);
  });

  it('toggles the dark class on <html> with the resolved theme', async () => {
    const { user } = renderWithProviders(<Probe />);
    await user.click(screen.getByText('dark'));
    expect(isDark()).toBe(true);
    await user.click(screen.getByText('cycle')); // dark -> system (OS light)
    expect(isDark()).toBe(false);
  });

  it('persists the preference in localStorage', async () => {
    const { user } = renderWithProviders(<Probe />);
    await user.click(screen.getByText('cycle'));
    expect(localStorage.getItem('theme')).toBe('light');
    await user.click(screen.getByText('cycle'));
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('restores a stored preference on mount', () => {
    localStorage.setItem('theme', 'dark');
    renderWithProviders(<Probe />);
    expect(pref()).toBe('dark');
    expect(isDark()).toBe(true);
  });

  it('falls back to system for invalid stored values', () => {
    localStorage.setItem('theme', 'neon');
    renderWithProviders(<Probe />);
    expect(pref()).toBe('system');
  });

  it('keeps working when localStorage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const { user } = renderWithProviders(<Probe />);
    expect(pref()).toBe('system');
    await user.click(screen.getByText('cycle'));
    expect(pref()).toBe('light');
    vi.restoreAllMocks();
  });

  it('removes its matchMedia listener on unmount', () => {
    const media = mockMatchMedia(false);
    const { unmount } = render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(media.listenerCount()).toBe(1);
    unmount();
    expect(media.listenerCount()).toBe(0);
  });

  it('useTheme throws outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/within ThemeProvider/);
    spy.mockRestore();
  });
});
