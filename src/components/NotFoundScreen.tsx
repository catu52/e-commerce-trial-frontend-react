import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';
import { Seo } from './Seo';

export default function NotFoundScreen() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center gap-6 px-6 py-24">
      <Seo noindex title="Page not found" path="/404" />
      <p className="font-mono text-xs uppercase tracking-widest text-ink">ERROR // PAGE NOT FOUND</p>
      <h1 className="border-4 border-ink bg-[#ffcc00] px-6 py-2 font-headline text-8xl font-bold text-[#1a1a1a] shadow-[8px_8px_0_0_var(--color-ink)]">
        404
      </h1>
      <p className="font-mono text-sm text-ink">
        The page you are looking for is not in the archive.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          to={ROUTES.home}
          className="border-2 border-ink bg-paper px-6 py-3 font-mono text-sm font-bold uppercase text-ink hover:bg-[#ffcc00] hover:text-[#1a1a1a]"
        >
          Back to home
        </Link>
        <Link
          to={ROUTES.shop}
          className="border-2 border-ink bg-ink px-6 py-3 font-mono text-sm font-bold uppercase text-paper hover:bg-[#ffcc00] hover:text-[#1a1a1a]"
        >
          Browse shop
        </Link>
      </div>
    </main>
  );
}

export { NotFoundScreen };
