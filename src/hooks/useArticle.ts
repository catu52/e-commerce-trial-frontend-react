import { useEffect, useState } from 'react';
import type { ArticleDetail, PreviewCredentials } from '../types';
import { getArticle } from '../services/articles';
import { ApiError } from '../lib/api';

export type ArticleState =
  | { status: 'loading' }
  | { status: 'found'; article: ArticleDetail['article']; related: ArticleDetail['related']; previewStatus?: ArticleDetail['previewStatus'] }
  | { status: 'not-found' }
  | { status: 'error'; message: string };

export function useArticle(slug: string | undefined, preview?: PreviewCredentials): ArticleState {
  const [fetched, setFetched] = useState<{ key: string; state: ArticleState } | null>(null);
  const key = slug ? `${slug}|${preview?.expires ?? ''}|${preview?.signature ?? ''}` : '';
  const expires = preview?.expires;
  const signature = preview?.signature;

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    getArticle(slug, expires && signature ? { expires, signature } : undefined)
      .then(({ article, related, previewStatus }) => !cancelled && setFetched({ key, state: { status: 'found', article, related, previewStatus } }))
      .catch((err) => {
        if (cancelled) return;
        const state: ArticleState =
          err instanceof ApiError && err.status === 404
            ? { status: 'not-found' }
            : { status: 'error', message: err instanceof ApiError ? err.message : 'Failed to load article.' };
        setFetched({ key, state });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, key, expires, signature]);

  if (!slug) return { status: 'not-found' };
  if (fetched && fetched.key === key) return fetched.state;
  return { status: 'loading' };
}
