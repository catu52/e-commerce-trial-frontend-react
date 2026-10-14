import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CartItem } from '../types';
import { CartDrawer } from './CartDrawer';

const item = (over: Partial<CartItem> = {}): CartItem => ({
  id: 'c1',
  productId: '1',
  title: 'RAW DENIM JACKET',
  image: 'https://img.test/a.jpg',
  priceEUR: 100,
  sku: 'SKU-001',
  size: 'M',
  color: 'BLACK',
  quantity: 2,
  ...over,
});

const setup = (props: Partial<React.ComponentProps<typeof CartDrawer>> = {}) => {
  const handlers = {
    onClose: vi.fn(),
    onUpdateQuantity: vi.fn(),
    onRemoveItem: vi.fn(),
    onClearCart: vi.fn(),
    onAddComplement: vi.fn(),
    onProceedToCheckout: vi.fn(),
    onShowToast: vi.fn(),
  };
  const user = userEvent.setup();
  const utils = render(<CartDrawer isOpen items={[item()]} currency="EUR" {...handlers} {...props} />);
  return { user, ...handlers, ...utils };
};

const openPromo = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByText(/PROMO MATRIX/));
};

describe('CartDrawer', () => {
  it('renders nothing when closed', () => {
    const { container } = setup({ isOpen: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the empty state and unit count 00', () => {
    setup({ items: [] });
    expect(screen.getByText('DISPATCH BAG IS EMPTY')).toBeInTheDocument();
    expect(screen.getByText('[00 ITEMS]')).toBeInTheDocument();
    expect(screen.getByText('ESTIMATED TOTAL DUE').parentElement?.parentElement).toHaveTextContent('€0.00');
  });

  it('lists items with sku/size/color, unit count and subtotal', () => {
    setup({ items: [item(), item({ id: 'c2', title: 'TEE', priceEUR: 50, quantity: 1, sku: 'SKU-2' })] });
    expect(screen.getByText('[03 ITEMS]')).toBeInTheDocument();
    expect(screen.getByText('RAW DENIM JACKET')).toBeInTheDocument();
    expect(screen.getByText('SKU-001')).toBeInTheDocument();
    expect(screen.getByText('SUBTOTAL (03 UNITS)').nextElementSibling).toHaveTextContent('€250.00');
  });

  it('converts displayed prices to the selected currency', () => {
    setup({ currency: 'USD', items: [item({ quantity: 1 })] });
    expect(screen.getByText('SUBTOTAL (01 UNITS)').nextElementSibling).toHaveTextContent('$108.00');
  });

  it('quantity buttons and remove/clear call back with the right ids', async () => {
    const { user, onUpdateQuantity, onRemoveItem, onClearCart } = setup();
    await user.click(screen.getByLabelText('Increase quantity'));
    await user.click(screen.getByLabelText('Decrease quantity'));
    expect(onUpdateQuantity.mock.calls).toEqual([['c1', 1], ['c1', -1]]);
    await user.click(screen.getByText('REMOVE'));
    expect(onRemoveItem).toHaveBeenCalledWith('c1');
    await user.click(screen.getByText('CLEAR ALL'));
    expect(onClearCart).toHaveBeenCalled();
  });

  it('closes via the close button and the backdrop', async () => {
    const { user, onClose, container } = setup();
    await user.click(screen.getByLabelText('Close Cart Drawer'));
    await user.click(container.querySelector('.backdrop-blur-sm') as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  describe('free shipping meter', () => {
    it('shows the remaining amount and progress below the threshold', () => {
      setup({ items: [item({ priceEUR: 150, quantity: 1 })] });
      expect(screen.getByText('ADD €450.00 MORE')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
      expect(screen.getByText('CALCULATED AT STEP 2')).toBeInTheDocument();
    });

    it('unlocks at exactly 600 and caps progress at 100', () => {
      setup({ items: [item({ priceEUR: 600, quantity: 1 })] });
      expect(screen.getByText(/FREE GLOBAL COURIER UNLOCKED/)).toBeInTheDocument();
      expect(screen.getByText('FREE [QUALIFIED]')).toBeInTheDocument();
    });

    it('caps progress at 100 above the threshold', () => {
      setup({ items: [item({ priceEUR: 1000, quantity: 1 })] });
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('promo code', () => {
    const apply = async (user: ReturnType<typeof userEvent.setup>, code: string) => {
      await openPromo(user);
      await user.type(screen.getByPlaceholderText('TRY: BAUHAUS10'), code);
      await user.click(screen.getByRole('button', { name: 'APPLY' }));
    };

    it('applies BAUHAUS10 case-insensitively with surrounding spaces: 10% off the total', async () => {
      const { user, onShowToast } = setup({ items: [item({ priceEUR: 200, quantity: 1 })] });
      await apply(user, '  bauhaus10 ');
      expect(onShowToast).toHaveBeenCalledWith('ARCHIVAL ACCESS CODE APPLIED: 10% DEDUCTION');
      expect(screen.getByText('VOUCHER DISCOUNT (10%)').nextElementSibling).toHaveTextContent('- €20.00');
      expect(screen.getByText('ESTIMATED TOTAL DUE').closest('div.flex.justify-between')).toHaveTextContent('€180.00');
    });

    it('accepts KRAFT10', async () => {
      const { user, onShowToast } = setup();
      await apply(user, 'KRAFT10');
      expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('APPLIED'));
    });

    it('rejects unknown codes without discount', async () => {
      const { user, onShowToast } = setup();
      await apply(user, 'NOPE');
      expect(onShowToast).toHaveBeenCalledWith('VOUCHER CODE NOT FOUND IN ACTIVE LEDGER');
      expect(screen.queryByText('VOUCHER DISCOUNT (10%)')).not.toBeInTheDocument();
    });

    it('ignores empty/blank submissions silently', async () => {
      const { user, onShowToast } = setup();
      await apply(user, '   ');
      expect(onShowToast).not.toHaveBeenCalled();
    });
  });

  describe('checkout', () => {
    it('toasts and does not navigate when the bag is empty', async () => {
      const { user, onShowToast, onProceedToCheckout, onClose } = setup({ items: [] });
      await user.click(screen.getByRole('button', { name: /PROCEED TO SECURE DISPATCH CHECKOUT/ }));
      expect(onShowToast).toHaveBeenCalledWith('BAG IS EMPTY. SELECT PIECES FIRST.');
      expect(onProceedToCheckout).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('closes and proceeds when there are items', async () => {
      const { user, onProceedToCheckout, onClose } = setup();
      await user.click(screen.getByRole('button', { name: /PROCEED TO SECURE DISPATCH CHECKOUT/ }));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onProceedToCheckout).toHaveBeenCalledTimes(1);
    });
  });

  describe('complements', () => {
    it('adds the ring with its fixed size', async () => {
      const { user, onAddComplement } = setup();
      const ring = screen.getByText('SOLID 925 ARCHITECT SIGNET RING').closest('div.flex.items-center') as HTMLElement;
      await user.click(within(ring.parentElement as HTMLElement).getAllByText('+ ADD')[0]);
      expect(onAddComplement).toHaveBeenCalledWith('SOLID 925 ARCHITECT SIGNET RING', 140, 'SKU-KFT-ACC-99', '62');
    });

    it('adds the tee with the selected size', async () => {
      const { user, onAddComplement } = setup();
      await user.selectOptions(screen.getByLabelText('Tee Size'), 'XL');
      await user.click(screen.getAllByText('+ ADD')[1]);
      expect(onAddComplement).toHaveBeenCalledWith('HEAVY MOCKNECK COTTON TEE', 95, 'SKU-KFT-MCK-11', 'XL');
    });
  });
});
