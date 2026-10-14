import { useEffect, useState } from 'react';
import type { SiteContent } from '../types';
import { fetchHomePage, fetchSiteSettings } from '../services/content';
import { DEFAULT_SITE_CONTENT } from '../data/defaultContent';

interface Snapshot {
  content: SiteContent;
  loading: boolean;
  error: string | null;
}

let snapshot: Snapshot = { content: DEFAULT_SITE_CONTENT, loading: true, error: null };
let inflight: Promise<void> | null = null;
let started = false;
const listeners = new Set<() => void>();

const publish = (next: Snapshot) => {
  snapshot = next;
  listeners.forEach((l) => l());
};

// Each source fails independently so one content endpoint being down keeps the other's content.
function load(): Promise<void> {
  if (inflight) return inflight;
  started = true;
  inflight = Promise.allSettled([fetchHomePage(), fetchSiteSettings()]).then(([home, settings]) => {
    const failed = home.status === 'rejected' || settings.status === 'rejected';
    publish({
      content: {
        home: home.status === 'fulfilled' ? home.value : DEFAULT_SITE_CONTENT.home,
        settings: settings.status === 'fulfilled' ? settings.value : DEFAULT_SITE_CONTENT.settings,
      },
      loading: false,
      error: failed ? 'Editorial content unavailable; showing defaults.' : null,
    });
    // Allow a later mount to retry after a failure.
    if (failed) inflight = null;
  });
  return inflight;
}

/** Test helper: clears the shared cache. */
export function resetSiteContentCache(): void {
  inflight = null;
  started = false;
  snapshot = { content: DEFAULT_SITE_CONTENT, loading: true, error: null };
}

export function useSiteContent(): Snapshot {
  const [state, setState] = useState<Snapshot>(snapshot);

  useEffect(() => {
    const sync = () => setState(snapshot);
    listeners.add(sync);
    if (!started || (!inflight && snapshot.error)) void load();
    sync();
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return state;
}
