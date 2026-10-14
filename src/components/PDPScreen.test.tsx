import { renderWithProviders, screen } from '../test/utils';
import { PDPScreen } from './PDPScreen';
import { makeProduct, products } from '../test/handlers';
import type { Product } from '../types';

const renderPdp = (product: Product) =>
  renderWithProviders(
    <PDPScreen
      product={product}
      currency="EUR"
      onAddToCart={vi.fn()}
      onSelectProduct={vi.fn()}
      allProducts={products}
      onOpenCart={vi.fn()}
      onShowToast={vi.fn()}
    />,
  );

describe('PDPScreen editorial fields', () => {
  it('renders headline, long description and care instructions when present', () => {
    renderPdp(products[0]);
    expect(screen.getByText('BUILT FOR WEATHER')).toBeInTheDocument();
    expect(screen.getByText('Long form story about the jacket.')).toBeInTheDocument();
    expect(screen.getByText('Spot clean only.')).toBeInTheDocument();
  });

  it('omits editorial blocks when fields are null', () => {
    renderPdp(makeProduct());
    expect(screen.queryByText('BUILT FOR WEATHER')).not.toBeInTheDocument();
    expect(screen.queryByText(/CARE INSTRUCTIONS/)).not.toBeInTheDocument();
  });

  it('links related products to their pages with lazy, alt-texted images', () => {
    renderPdp(products[0]);
    const related = products.find((p) => p.id !== products[0].id)!;
    const links = screen.queryAllByRole('link', { name: new RegExp(related.title) });
    links.forEach((l) => expect(l).toHaveAttribute('href', `/products/${related.slug}`));
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByAltText(products[0].title)).not.toHaveAttribute('loading');
  });
});
