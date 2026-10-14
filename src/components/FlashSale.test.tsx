import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeFlashSale, flashSalesResponse } from '../test/handlers';
import { FLASH_SALE_DEFAULT_FILTERS } from '../config';
import { FlashSaleCard } from './FlashSaleCard';
import { FlashSaleFilterBar } from './FlashSaleFilterBar';

const setupCard = (sale = makeFlashSale(), onReserve = vi.fn().mockResolvedValue(undefined), currency: 'EUR' | 'USD' = 'EUR') => {
  const user = userEvent.setup();
  render(<FlashSaleCard sale={sale} currency={currency} serverTime="2030-01-01T00:00:00Z" onReserve={onReserve} />);
  return { user, onReserve };
};

describe('FlashSaleCard', () => {
  it('renders product, discount, prices and stock', () => {
    setupCard();
    expect(screen.getByRole('heading', { name: 'RAW DENIM JACKET' })).toBeInTheDocument();
    expect(screen.getByText('-50% ARCHIVE DISCOUNT')).toBeInTheDocument();
    expect(screen.getByText('€100.00')).toBeInTheDocument();
    expect(screen.getByText('€200.00')).toHaveClass('line-through');
    expect(screen.getByText('5 UNITS')).toBeInTheDocument();
    expect(screen.getByText('50% DEPLETED')).toBeInTheDocument();
    expect(screen.getByText('SKU-001 // OUTERWEAR')).toBeInTheDocument();
  });

  it('converts prices to the chosen currency', () => {
    setupCard(makeFlashSale(), undefined, 'USD');
    expect(screen.getByText('$108.00')).toBeInTheDocument();
  });

  it.each([
    [{ stockState: 'low' as const, availableStock: 3 }, 'LOW: 3 UNITS'],
    [{ stockState: 'critical' as const, availableStock: 1 }, 'CRITICAL: ONLY 1 UNITS'],
  ])('stock label for %j', (over, text) => {
    setupCard(makeFlashSale(over));
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('calls onReserve with the sale and shows ALLOCATING while pending', async () => {
    let release!: () => void;
    const onReserve = vi.fn(() => new Promise<void>((r) => (release = r)));
    const sale = makeFlashSale();
    const { user } = setupCard(sale, onReserve);
    await user.click(screen.getByRole('button', { name: /INSTANT ALLOCATION/ }));
    expect(onReserve).toHaveBeenCalledWith(sale);
    const busy = await screen.findByRole('button', { name: /ALLOCATING/ });
    expect(busy).toBeDisabled();
    release();
    await waitFor(() => expect(screen.getByRole('button', { name: /INSTANT ALLOCATION/ })).toBeEnabled());
  });

  it('re-enables the button even if onReserve rejects', async () => {
    const onReserve = vi.fn().mockRejectedValue(new Error('x'));
    const { user } = setupCard(makeFlashSale(), onReserve);
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    await user.click(screen.getByRole('button', { name: /INSTANT ALLOCATION/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: /INSTANT ALLOCATION/ })).toBeEnabled());
    process.off('unhandledRejection', unhandled);
  });

  it('is disabled and labelled SOLD OUT when no stock is left', async () => {
    const { user, onReserve } = setupCard(makeFlashSale({ availableStock: 0 }));
    const btn = screen.getByRole('button', { name: /SOLD OUT/ });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onReserve).not.toHaveBeenCalled();
    expect(screen.getAllByText('SOLD OUT')).toHaveLength(2);
  });

  it('upcoming sales show a countdown and cannot be reserved', async () => {
    const { user, onReserve } = setupCard(makeFlashSale({ status: 'upcoming', startsAt: '2030-01-01T02:30:15Z' }));
    expect(screen.getByText('UPCOMING')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /STARTS IN 02:30:\d\d/ });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onReserve).not.toHaveBeenCalled();
  });

  it('caps the depletion bar at 100%', () => {
    const { container } = render(
      <FlashSaleCard sale={makeFlashSale({ depletionPercent: 140 })} currency="EUR" serverTime={null} onReserve={vi.fn()} />,
    );
    expect((container.querySelector('.bg-secondary[style]') as HTMLElement).style.width).toBe('100%');
  });
});

describe('FlashSaleFilterBar', () => {
  const meta = flashSalesResponse([makeFlashSale()], {
    tiers: { all: 9, '40': 4, '50': 3, '60': 2 },
    categories: [{ name: 'Outerwear', slug: 'outerwear', count: 4 }, { name: 'Shoes', slug: 'shoes', count: 5 }],
  }).meta;

  const setup = (filters = FLASH_SALE_DEFAULT_FILTERS, m: typeof meta | null = meta) => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<FlashSaleFilterBar filters={filters} meta={m} onChange={onChange} />);
    return { user, onChange };
  };

  it('shows tier counts from meta', () => {
    setup();
    expect(screen.getByRole('button', { name: 'ALL ARCHIVE [9]' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '40% OFF OUTERWEAR [4]' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '60% OFF RUNWAY & ACC [2]' })).toBeInTheDocument();
  });

  it('defaults counts to 0 and has no categories without meta', () => {
    setup(FLASH_SALE_DEFAULT_FILTERS, null);
    expect(screen.getByRole('button', { name: 'ALL ARCHIVE [0]' })).toBeInTheDocument();
    expect(screen.getAllByRole('option').filter((o) => o.getAttribute('value') === 'shoes')).toHaveLength(0);
  });

  it('emits tier changes', async () => {
    const { user, onChange } = setup();
    await user.click(screen.getByRole('button', { name: /50% OFF TAILORING/ }));
    expect(onChange).toHaveBeenCalledWith({ tier: '50' });
  });

  it('emits size selection and toggles it off when clicked again', async () => {
    const { user, onChange } = setup();
    await user.click(screen.getByRole('button', { name: 'M' }));
    expect(onChange).toHaveBeenLastCalledWith({ size: 'M' });
    onChange.mockClear();
    const { user: u2, onChange: c2 } = setup({ ...FLASH_SALE_DEFAULT_FILTERS, size: 'M' });
    await u2.click(screen.getAllByRole('button', { name: 'M' })[1]);
    expect(c2).toHaveBeenCalledWith({ size: '' });
  });

  it('emits category and sort changes', async () => {
    const { user, onChange } = setup();
    const [cat, sort] = screen.getAllByRole('combobox');
    await user.selectOptions(cat, 'shoes');
    expect(onChange).toHaveBeenLastCalledWith({ category: 'shoes' });
    await user.selectOptions(sort, 'price_desc');
    expect(onChange).toHaveBeenLastCalledWith({ sort: 'price_desc' });
  });

  it('lists categories uppercased with counts and reflects current values', () => {
    setup({ ...FLASH_SALE_DEFAULT_FILTERS, category: 'shoes', sort: 'depletion' });
    expect(screen.getByRole('option', { name: 'SHOES [5]' })).toBeInTheDocument();
    const [cat, sort] = screen.getAllByRole('combobox') as HTMLSelectElement[];
    expect(cat.value).toBe('shoes');
    expect(sort.value).toBe('depletion');
  });
});
