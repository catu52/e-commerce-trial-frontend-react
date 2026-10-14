import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes';
import type { ArticleSummary } from '../../types';

export function formatArticleDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function ArticleMeta({ article }: { article: ArticleSummary }) {
  const date = formatArticleDate(article.publishedAt);
  return (
    <p className="font-mono text-[11px] uppercase tracking-widest text-ink/70">
      {article.author && <span>{article.author}</span>}
      {article.author && date && ' · '}
      {date && <time dateTime={article.publishedAt}>{date}</time>}
      {' · '}
      <span>{article.readingMinutes} min read</span>
    </p>
  );
}

export function ArticleCard({
  article,
  featured = false,
  headingLevel = 'h2',
}: {
  article: ArticleSummary;
  featured?: boolean;
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;
  return (
    <article className="h-full">
      <Link
        to={ROUTES.article(article.slug)}
        className={`group flex h-full border-2 border-ink bg-paper-3 text-ink shadow-[6px_6px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 ${
          featured ? 'flex-col lg:flex-row' : 'flex-col'
        }`}
      >
        <div className={`border-b-2 border-ink bg-paper-2 ${featured ? 'lg:w-3/5 lg:border-b-0 lg:border-r-2' : ''}`}>
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.coverImageAlt}
              loading="lazy"
              className={`w-full object-cover ${featured ? 'aspect-[16/10] lg:h-full' : 'aspect-[4/3]'}`}
            />
          ) : (
            <div
              data-testid="cover-placeholder"
              aria-hidden="true"
              className={`flex w-full items-center justify-center bg-[#ffcc00] font-headline text-6xl font-bold text-[#1a1a1a] ${
                featured ? 'aspect-[16/10] lg:h-full' : 'aspect-[4/3]'
              }`}
            >
              K*
            </div>
          )}
        </div>
        <div className={`flex flex-1 flex-col gap-3 p-5 ${featured ? 'lg:w-2/5 lg:justify-center lg:p-8' : ''}`}>
          {article.category && (
            <span className="w-fit border-2 border-ink bg-[#ffcc00] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]">
              {article.category}
            </span>
          )}
          <Heading
            className={`font-headline font-bold uppercase leading-tight tracking-tight group-hover:underline ${
              featured ? 'text-3xl lg:text-5xl' : 'text-xl'
            }`}
          >
            {article.title}
          </Heading>
          <p className="font-body text-sm text-ink/80">{article.excerpt}</p>
          <div className="mt-auto pt-2">
            <ArticleMeta article={article} />
          </div>
        </div>
      </Link>
    </article>
  );
}
