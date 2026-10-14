<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/336682f0-c7ad-4a0a-90de-d1b68a871d8b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Editorial content (Laravel + Filament)

Editorial content (home hero, lookbook, editorial block, announcement, footer tagline, social links and store locations) is served by the Laravel API at `GET /content/home` and `GET /content/site-settings` under `VITE_API_BASE_URL`. Products also carry optional `headline`, `longDescription`, `careInstructions`, `seoTitle` and `seoDescription`, shown on the product page.

- If an endpoint is unreachable or a field is missing, the storefront falls back per field to the built-in copy in `src/data/defaultContent.ts`.

## Testing

Vitest + jsdom + React Testing Library + MSW v2. Run inside the dev container (`docker exec react_headless_dev sh -c "cd /app && npm run test:run"`).

| Command | What it does |
| --- | --- |
| `npm test` | Watch mode |
| `npm run test:run` | Single run (CI) |
| `npm run test:coverage` | Single run with v8 coverage (text + `coverage/` HTML) |
| `npm run lint` | `tsc --noEmit` (also type-checks tests) |

**Structure** – tests sit next to the code (`*.test.ts(x)`); shared helpers live in `src/test/`:

- `setup.ts` – jest-dom matchers, MSW lifecycle (`onUnhandledRequest: 'error'`), per-test `localStorage` reset, `dark` class reset, `matchMedia` mock.
- `matchMedia.ts` – `mockMatchMedia(initial)` returns `{ setMatches, listenerCount }` to simulate OS theme changes.
- `server.ts` / `handlers.ts` – MSW server and default happy-path handlers for the Laravel API (`http://localhost:8000/api/v1`, forced in `vitest.config.ts`), plus fixtures (`makeProduct`, `makeFlashSale`, `makeClient`, `flashSalesResponse`, `TEST_TOKEN`).
- **Editorial content** – default handlers for `GET /content/home` and `/content/site-settings` at the API base (`API`) return `homeFixture` / `settingsFixture`. `setup.ts` calls `resetSiteContentCache()` after each test so the shared `useSiteContent` cache doesn't leak; override with `server.use(http.get(API + '/content/site-settings', ...))` to test fallbacks.
- `utils.tsx` – `renderWithProviders(ui)` (ThemeProvider + AuthProvider, returns a `userEvent` instance as `user`), `loginAsTestClient()`, `rejection(promise)`, and re-exports of RTL helpers.

**Adding / overriding API handlers** – add a `http.get/post(`${API}/path`, resolver)` entry to `handlers` in `src/test/handlers.ts` for defaults. In a single test, override with `server.use(http.get(`${API}/path`, () => HttpResponse.json({...}, { status: 500 })))`; overrides are reset after each test. Any request without a handler fails the test.
