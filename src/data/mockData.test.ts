import { formatPrice, CURRENCY_RATES } from './mockData';

describe('formatPrice', () => {
  it('formats EUR with symbol and 2 decimals', () => {
    expect(formatPrice(250, 'EUR')).toBe('€250.00');
    expect(formatPrice(0, 'EUR')).toBe('€0.00');
  });

  it('converts using the currency rate', () => {
    expect(formatPrice(100, 'USD')).toBe(`$${(100 * CURRENCY_RATES.USD.rate).toFixed(2)}`);
    expect(formatPrice(100, 'GBP')).toBe('£85.00');
  });

  it('rounds JPY to whole yen without decimals', () => {
    expect(formatPrice(1, 'JPY')).toBe('¥165');
    expect(formatPrice(0.01, 'JPY')).toBe('¥2');
    expect(formatPrice(1000, 'JPY')).not.toContain('.');
  });

  it('falls back to EUR for unknown currencies', () => {
    expect(formatPrice(10, 'XXX')).toBe('€10.00');
  });

  it('rounds fractional values to 2 decimals', () => {
    expect(formatPrice(10.005, 'EUR')).toMatch(/^€10\.0[01]$/);
    expect(formatPrice(19.999, 'EUR')).toBe('€20.00');
  });
});
