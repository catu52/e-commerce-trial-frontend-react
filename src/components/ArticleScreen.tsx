import { Link, useSearchParams } from 'react-router-dom';
import Markdown, { type Components } from 'react-markdown';
import { ROUTES } from '../routes';
import { useArticle } from '../hooks/useArticle';
import { articleLd, breadcrumbLd } from '../lib/structuredData';
import { Seo } from './Seo';
import { NotFoundScreen } from './NotFoundScreen';
import { ArticleCard, ArticleMeta } from './editorial/ArticleCard';

const isExternal = (href: string) => /^(https?:)?\/\//i.test(href);

export const markdownComponents: Components = {
  h1: ({ children }) => <h2 className="mt-10 mb-4 font-headline text-3xl font-bold uppercase tracking-tight text-ink">{children}</h2>,
  h2: ({ children }) => <h2 className="mt-10 mb-4 font-headline text-3xl font-bold uppercase tracking-tight text-ink">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 mb-3 font-headline text-2xl font-bold uppercase tracking-tight text-ink">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-6 mb-2 font-headline text-lg font-bold uppercase text-ink">{children}</h4>,
  p: ({ children }) => <p className="my-4 font-body text-base leading-relaxed text-ink">{children}</p>,
  ul: ({ children }) => <ul className="my-4 list-disc space-y-1 pl-6 text-ink marker:text-ink">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-1 pl-6 text-ink marker:text-ink">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-ink bg-paper-2 py-2 pl-5 pr-4 font-body text-lg italic text-ink">{children}</blockquote>
  ),
  hr: () => <hr className="my-8 border-t-2 border-ink" />,
  code: ({ children }) => <code className="bg-paper-2 px-1 py-0.5 font-mono text-sm text-ink">{children}</code>,
  pre: ({ children }) => <pre className="my-4 overflow-x-auto border-2 border-ink bg-paper-2 p-4 text-ink">{children}</pre>,
  img: ({ src, alt }) => <img src={src} alt={alt ?? ''} loading="lazy" className="my-6 w-full border-2 border-ink" />,
  a: ({ href, children }) => {
    const cls = 'font-bold text-ink underline decoration-[#ffcc00] decoration-2 underline-offset-2 hover:bg-[#ffcc00] hover:text-[#1a1a1a]';
    if (!href) return <span>{children}</span>;
    if (isExternal(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {children}
        </a>
      );
    }
    if (href.startsWith('/')) {
      return (
        <Link to={href} className={cls}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  },
};

export default function ArticleScreen({ slug }: { slug: string }) {
  const [params] = useSearchParams();
  const expires = params.get('expires');
  const signature = params.get('signature');
  const isPreview = params.get('preview') === '1' && !!expires && !!signature;
  const state = useArticle(slug, isPreview ? { expires, signature } : undefined);

  if (state.status === 'loading') {
    return <p role="status" className="py-24 text-center font-mono text-sm uppercase">LOADING ARTICLE...</p>;
  }
  if (state.status === 'not-found') return <NotFoundScreen />;
  if (state.status === 'error') {
    return (
      <div role="alert" className="space-y-4 py-24 text-center font-mono text-sm uppercase">
        <p className="font-bold text-[#e63b2e]">ARTICLE UNAVAILABLE: {state.message}</p>
        <Link to={ROUTES.editorial} className="underline">
          Back to editorial
        </Link>
      </div>
    );
  }

  const { article, related, previewStatus } = state;
  const path = ROUTES.article(article.slug);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <Seo
        path={path}
        title={article.seoTitle || article.title}
        description={article.seoDescription || article.excerpt}
        image={article.coverImage ?? undefined}
        type="article"
        noindex={isPreview}
        article={{ publishedTime: article.publishedAt, modifiedTime: article.updatedAt, author: article.author || undefined }}
        jsonLd={[
          articleLd(article),
          breadcrumbLd([
            { name: 'Home', path: ROUTES.home },
            { name: 'Editorial', path: ROUTES.editorial },
            { name: article.title, path },
          ]),
        ]}
      />
      {isPreview && (
        <p role="status" className="mb-6 border-2 border-ink bg-[#ffcc00] px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-[#1a1a1a]">
          Preview mode · {previewStatus === 'scheduled' ? 'scheduled' : previewStatus === 'published' ? 'published' : 'draft'} — not visible to the public
        </p>
      )}
      <nav aria-label="Breadcrumb" className="mb-6 font-mono text-xs uppercase tracking-widest text-ink">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to={ROUTES.home} className="underline">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to={ROUTES.editorial} className="underline">Editorial</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{article.title}</li>
        </ol>
      </nav>

      <article>
        <header className="mb-8 space-y-4">
          {article.category && (
            <span className="inline-block border-2 border-ink bg-[#ffcc00] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]">
              {article.category}
            </span>
          )}
          <h1 className="font-headline text-4xl font-bold uppercase leading-tight tracking-tighter text-ink sm:text-6xl">
            {article.title}
          </h1>
          <ArticleMeta article={article} />
        </header>
        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.coverImageAlt}
            className="mb-8 w-full border-2 border-ink shadow-[6px_6px_0_0_var(--color-ink)]"
          />
        )}
        <div>
          <Markdown components={markdownComponents}>{article.body}</Markdown>
        </div>
      </article>

      <div className="mt-10">
        <Link
          to={ROUTES.editorial}
          className="inline-block border-2 border-ink bg-paper px-5 py-2 font-mono text-sm font-bold uppercase text-ink hover:bg-[#ffcc00] hover:text-[#1a1a1a]"
        >
          ← Back to editorial
        </Link>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-16">
          <h2 id="related-heading" className="mb-6 font-headline text-2xl font-bold uppercase tracking-tight text-ink">
            Related articles
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {related.map((r) => (
              <ArticleCard key={r.id} article={r} headingLevel="h3" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export { ArticleScreen };
