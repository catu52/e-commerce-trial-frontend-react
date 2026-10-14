type Listener = (e: MediaQueryListEvent) => void;

export interface MatchMediaController {
  /** Simulates the OS changing its colour scheme and notifies listeners. */
  setMatches: (matches: boolean) => void;
  listenerCount: () => number;
}

/** Installs a window.matchMedia mock where every query shares one `matches` value. */
export function mockMatchMedia(initialMatches = false): MatchMediaController {
  let matches = initialMatches;
  const listeners = new Set<Listener>();

  window.matchMedia = ((query: string) => ({
    get matches() {
      return matches;
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, l: Listener) => listeners.add(l),
    removeEventListener: (_: string, l: Listener) => listeners.delete(l),
    addListener: (l: Listener) => listeners.add(l),
    removeListener: (l: Listener) => listeners.delete(l),
    dispatchEvent: () => true,
  })) as unknown as typeof window.matchMedia;

  return {
    setMatches(next) {
      matches = next;
      listeners.forEach((l) => l({ matches: next } as MediaQueryListEvent));
    },
    listenerCount: () => listeners.size,
  };
}
