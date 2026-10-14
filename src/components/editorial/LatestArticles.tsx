import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes';
import { useArticles } from '../../hooks/useArticles';
import { ArticleCard } from './ArticleCard';

/** Home teaser; renders nothing while loading, on failure, or when there are no articles. */
export function LatestArticles() {
  const { articles, loading, error } = useArticles({ perPage: 3 });
  if (loading || error || articles.length === 0) return null;
  return (
    <section aria-labelledby="latest-articles-heading" className="w-full px-4 lg:px-12 py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 id="latest-articles-heading" className="font-headline text-3xl font-bold uppercase tracking-tight text-primary">
          From the editorial
        </h2>
        <Link to={ROUTES.editorial} className="font-mono text-xs font-bold uppercase underline text-primary">
          All articles →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {articles.slice(0, 3).map((a) => (
          <ArticleCard key={a.id} article={a} headingLevel="h3" />
        ))}
      </div>
    </section>
  );
}
