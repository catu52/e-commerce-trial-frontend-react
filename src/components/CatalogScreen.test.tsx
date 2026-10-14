import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders as render } from '../test/utils';
import { makeProduct } from '../test/handlers';
import type { CatalogSection, Product } from '../types';
import { CatalogScreen } from './CatalogScreen';

const jacket = makeProduct();
const coat = makeProduct({ id: '2', title: 'WOOL COAT', code: 'KFT-002', sku: 'SKU-002', gender: 'women', priceEUR: 300 });
const shirt = makeProduct({ id: '3', title: 'LINEN SHIRT', code: 'KFT-003', sku: 'SKU-003', gender: 'women', category: 'SHIRTS', priceEUR: 90 });
const pricey = makeProduct({ id: '4', title: 'CASHMERE COAT', code: 'KFT-004', sku: 'SKU-004', priceEUR: 500 });
const soldOut = makeProduct({ id: '5', title: 'GONE PARKA', code: 'KFT-005', sku: 'SKU-005', inStock: false });
const noL = makeProduct({ id: '6', title: 'SMALL ONLY VEST', code: 'KFT-006', sku: 'SKU-006', sizes: ['S'] });

const setup = (props: Partial<React.ComponentProps<typeof CatalogScreen>> = {}) => {
  const handlers = { onSelectProduct: vi.fn(), onAddToCart: vi.fn(), onNavigate: vi.fn(), onShowToast: vi.fn() };
  const utils = render(
    <CatalogScreen products={[jacket, coat, shirt]} currency="EUR" {...handlers} {...props} />,
  );
  return { ...handlers, ...utils };
};

const titles = () => screen.queryAllByRole('heading', { level: 3 }).map((h) => h.textContent);

describe('CatalogScreen', () => {
  describe('sections', () => {
    it.each<[CatalogSection, string]>([
      ['all', 'NEW ARRIVALS'],
      ['men', 'MEN'],
      ['women', 'WOMEN'],
    ])('shows the %s heading', (section, label) => {
      setup({ section });
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(`${label}*`);
    });

    it('"all" defaults to the OUTERWEAR category filter, hiding other categories', () => {
      setup({ section: 'all' });
      expect(titles()).toEqual(expect.arrayContaining(['RAW DENIM JACKET', 'WOOL COAT']));
      expect(titles()).not.toContain('LINEN SHIRT');
      expect(screen.getByText('2 PIECES')).toBeInTheDocument();
    });

    it.each<CatalogSection>(['men', 'women'])('"%s" has no default category filter so every category is listed', (section) => {
      setup({ section });
      expect(titles()).toContain('LINEN SHIRT');
      expect(screen.getByText('3 PIECES')).toBeInTheDocument();
    });

    it('resets the category filter when the section prop changes', () => {
      const { rerender, ...rest } = setup({ section: 'all' });
      expect(titles()).not.toContain('LINEN SHIRT');
      rerender(
        <CatalogScreen
          products={[jacket, coat, shirt]}
          currency="EUR"
          section="women"
          onSelectProduct={rest.onSelectProduct}
          onAddToCart={rest.onAddToCart}
          onNavigate={rest.onNavigate}
          onShowToast={rest.onShowToast}
        />,
      );
      expect(titles()).toContain('LINEN SHIRT');
    });

    it('renders the products given (section filtering by gender is done server-side)', () => {
      setup({ section: 'women', products: [coat, shirt] });
      expect(titles()).toEqual(['WOOL COAT', 'LINEN SHIRT']);
      expect(screen.getByText('2 REGISTERED SPECIMENS')).toBeInTheDocument();
    });
  });

  describe('default filters', () => {
    it('hide products over the €380 price cap, out of stock, or lacking size L', () => {
      setup({ section: 'women', products: [jacket, pricey, soldOut, noL] });
      expect(titles()).toEqual(['RAW DENIM JACKET']);
    });

    it('removing the size pill reveals products without size L', async () => {
      const { user } = setup({ section: 'women', products: [jacket, noL] });
      expect(titles()).toEqual(['RAW DENIM JACKET']);
      const pill = screen.getByText(/SIZE: L/);
      await user.click(pill.querySelector('button') as HTMLElement);
      expect(titles()).toEqual(['RAW DENIM JACKET', 'SMALL ONLY VEST']);
    });

    it('removing the OUTERWEAR pill reveals other categories', async () => {
      const { user } = setup({ section: 'all' });
      const pill = screen.getByText('OUTERWEAR', { selector: 'span.inline-flex' });
      await user.click(pill.querySelector('button') as HTMLElement);
      expect(titles()).toContain('LINEN SHIRT');
    });

    it('RESET MATRIX clears filters and toasts', async () => {
      const { user, onShowToast } = setup({ section: 'women', products: [jacket, pricey, soldOut, noL] });
      await user.click(screen.getByText('RESET MATRIX'));
      expect(onShowToast).toHaveBeenCalledWith('FILTER MATRICES CLEARED');
      expect(titles()).toHaveLength(4);
    });
  });

  describe('search', () => {
    it('filters by title/category/sku (case-insensitive)', () => {
      setup({ section: 'women', initialSearchQuery: 'linen' });
      expect(titles()).toEqual(['LINEN SHIRT']);
    });

    it('matches by sku', () => {
      setup({ section: 'women', initialSearchQuery: 'sku-002' });
      expect(titles()).toEqual(['WOOL COAT']);
    });

    it('shows zero pieces when nothing matches', () => {
      setup({ section: 'women', initialSearchQuery: 'zzzz' });
      expect(titles()).toEqual([]);
      expect(screen.getByText('0 PIECES')).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('sorts by price ascending and descending', async () => {
      const { user } = setup({ section: 'women' });
      await user.selectOptions(screen.getByLabelText('Sort Order'), 'price-asc');
      expect(titles()).toEqual(['LINEN SHIRT', 'RAW DENIM JACKET', 'WOOL COAT']);
      await user.selectOptions(screen.getByLabelText('Sort Order'), 'price-desc');
      expect(titles()).toEqual(['WOOL COAT', 'RAW DENIM JACKET', 'LINEN SHIRT']);
    });
  });

  describe('interactions', () => {
    it('shows prices in the selected currency', () => {
      setup({ section: 'women', products: [jacket], currency: 'GBP' });
      expect(screen.getByText('£212.50')).toBeInTheDocument();
    });

    it('links the title and image to the product page, with lazy alt-texted images', () => {
      setup({ section: 'women', products: [jacket] });
      expect(screen.getByRole('link', { name: 'RAW DENIM JACKET' })).toHaveAttribute('href', '/products/raw-denim-jacket');
      const img = screen.getByAltText('RAW DENIM JACKET');
      expect(img.closest('a')).toHaveAttribute('href', '/products/raw-denim-jacket');
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    });

    it('quick-add uses the chosen size; sizes the product lacks are disabled', async () => {
      const { user, onAddToCart, onShowToast } = setup({ section: 'women', products: [jacket] });
      const card = screen.getByRole('heading', { level: 3, name: 'RAW DENIM JACKET' }).closest('.group') as HTMLElement;
      expect(within(card).getByRole('button', { name: 'XL' })).toBeDisabled();
      await user.click(within(card).getByRole('button', { name: 'M' }));
      expect(onAddToCart).toHaveBeenCalledWith(jacket, 'M');
      expect(onShowToast).toHaveBeenCalledWith('RAW DENIM JACKET (SIZE M) ADDED TO BAG');
    });

    it('toggles wishlist with toasts', async () => {
      const { user, onShowToast } = setup({ section: 'women', products: [jacket] });
      await user.click(screen.getByLabelText('Save to Wishlist'));
      expect(onShowToast).toHaveBeenLastCalledWith('RAW DENIM JACKET SAVED TO ARCHIVE');
      await user.click(screen.getByLabelText('Save to Wishlist'));
      expect(onShowToast).toHaveBeenLastCalledWith('RAW DENIM JACKET REMOVED FROM ARCHIVE');
    });

    it('hides and shows the filter panel', async () => {
      const { user } = setup({ section: 'women' });
      await user.click(screen.getByText('HIDE FILTERS'));
      expect(screen.getByText('SHOW FILTERS')).toBeInTheDocument();
      expect(screen.queryByText('RESET ALL CONDITIONS')).not.toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    const many: Product[] = Array.from({ length: 8 }, (_, i) =>
      makeProduct({ id: `p${i}`, title: `ITEM ${i}`, code: `C${i}`, sku: `S${i}` }),
    );

    it('shows 6 at first and loads more after the delay', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onShowToast = vi.fn();
      render(
        <CatalogScreen products={many} section="women" currency="EUR" onSelectProduct={vi.fn()} onAddToCart={vi.fn()} onNavigate={vi.fn()} onShowToast={onShowToast} />,
      );
      expect(titles()).toHaveLength(6);
      expect(screen.getByText('6 / 8 SHOWN')).toBeInTheDocument();
      await user.click(screen.getByText('LOAD MORE SPECIMENS'));
      expect(screen.getByText('RETRIEVING BATCH...')).toBeInTheDocument();
      await act(() => vi.advanceTimersByTimeAsync(600));
      expect(titles()).toHaveLength(8);
      expect(onShowToast).toHaveBeenCalledWith('ADDITIONAL SPECIMENS LOADED');
      expect(screen.getByText('ALL 8 SPECIMENS LOADED')).toBeInTheDocument();
    });
  });
});
