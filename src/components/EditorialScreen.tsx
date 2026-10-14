import { useSearchParams } from 'react-router-dom';
import { ROUTES } from '../routes';
import { useArticles } from '../hooks/useArticles';
import { breadcrumbLd } from '../lib/structuredData';
import { Seo } from './Seo';
import { ArticleCard } from './editorial/ArticleCard';

const PER_PAGE = 9;

const chip = (active: boolean) =>
  `border-2 border-ink px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest cursor-pointer ${
    active ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-[#ffcc00] hover:text-[#1a1a1a]'
  }`;

export default function EditorialScreen() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || undefined;
  const rawPage = Number.parseInt(params.get('page') ?? '1', 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const { articles, meta, categories, loading, error, reload } = useArticles({ page, perPage: PER_PAGE, category });

  const update = (next: { category?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (next.category) q.set('category', next.category);
    if (next.page && next.page > 1) q.set('page', String(next.page));
    setParams(q);
  };

  const filtered = Boolean(category) || page > 1;
  const featured = page === 1 ? (articles.find((a) => a.isFeatured) ?? articles[0]) : undefined;
  const rest = featured ? articles.filter((a) => a !== featured) : articles;
  const currentPage = meta?.currentPage ?? page;
  const lastPage = meta?.lastPage ?? 1;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-12">
      {/* Canonical stays /editorial; filtered and paginated views are noindex,follow. */}
      <Seo
        path={ROUTES.editorial}
        title="Editorial"
        description="Essays, interviews and field notes from the KRAFT Studio archive: design, materials and the people behind the work."
        noindex={filtered}
        follow
        jsonLd={breadcrumbLd([
          { name: 'Home', path: ROUTES.home },
          { name: 'Editorial', path: ROUTES.editorial },
        ])}
      />
      <header className="mb-8 space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-ink">ARCHIVE // EDITORIAL</p>
        <h1 className="font-headline text-5xl font-bold uppercase tracking-tighter text-ink sm:text-7xl">Editorial</h1>
      </header>

      <nav aria-label="Editorial categories" className="mb-10 flex flex-wrap gap-2">
        <button type="button" onClick={() => update({})} aria-pressed={!category} className={chip(!category)}>
          ALL
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => update({ category: c })}
            aria-pressed={category === c}
            className={chip(category === c)}
          >
            {c}
          </button>
        ))}
      </nav>

      {loading && <p role="status" className="py-16 text-center font-mono text-sm uppercase">LOADING EDITORIAL...</p>}

      {!loading && error && (
        <div role="alert" className="space-y-4 py-16 text-center font-mono text-sm uppercase">
          <p className="font-bold text-[#e63b2e]">EDITORIAL UNAVAILABLE: {error}</p>
          <button
            type="button"
            onClick={reload}
            className="border-2 border-ink bg-[#ffcc00] px-4 py-2 font-bold text-[#1a1a1a] hover:bg-panel hover:text-[#ffcc00]"
          >
            RETRY
          </button>
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <p className="py-16 text-center font-mono text-sm uppercase text-ink/70">NO ARTICLES PUBLISHED YET.</p>
      )}

      {!loading && !error && articles.length > 0 && (
        <>
          {featured && (
            <div className="mb-10">
              <ArticleCard article={featured} featured />
            </div>
          )}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
          {lastPage > 1 && (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-between gap-4 font-mono text-xs font-bold uppercase">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => update({ category, page: currentPage - 1 })}
                className="border-2 border-ink px-4 py-2 enabled:hover:bg-[#ffcc00] enabled:hover:text-[#1a1a1a] disabled:opacity-40"
              >
                ← PREV
              </button>
              <span>
                PAGE {currentPage} / {lastPage}
              </span>
              <button
                type="button"
                disabled={currentPage >= lastPage}
                onClick={() => update({ category, page: currentPage + 1 })}
                className="border-2 border-ink px-4 py-2 enabled:hover:bg-[#ffcc00] enabled:hover:text-[#1a1a1a] disabled:opacity-40"
              >
                NEXT →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export { EditorialScreen };
