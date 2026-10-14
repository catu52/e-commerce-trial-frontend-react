import { act, renderHook } from '@testing-library/react';
import { useCountdown } from './useCountdown';

const NOW = new Date('2030-01-01T00:00:00Z');

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  it('formats hours/minutes/seconds zero-padded', () => {
    const { result } = renderHook(() => useCountdown('2030-01-01T01:02:03Z'));
    expect(result.current).toMatchObject({ hours: '01', minutes: '02', seconds: '03', totalSeconds: 3723, expired: false });
  });

  it('ticks down every second', () => {
    const { result } = renderHook(() => useCountdown('2030-01-01T00:00:10Z'));
    expect(result.current.totalSeconds).toBe(10);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.totalSeconds).toBe(7);
    expect(result.current.seconds).toBe('07');
  });

  it('expires at zero and never goes negative', () => {
    const { result } = renderHook(() => useCountdown('2030-01-01T00:00:02Z'));
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(result.current).toMatchObject({ totalSeconds: 0, expired: true, hours: '00', minutes: '00', seconds: '00' });
  });

  it('is expired for past, null, undefined and invalid dates', () => {
    for (const v of ['2020-01-01T00:00:00Z', null, undefined, 'garbage']) {
      const { result } = renderHook(() => useCountdown(v as string));
      expect(result.current.expired).toBe(true);
      expect(result.current.totalSeconds).toBe(0);
    }
  });

  it('compensates for client clock skew using serverTime', () => {
    // client clock is 1h ahead of the server: server says it is 23:00, sale ends at 00:30 => 5400s
    const { result } = renderHook(() => useCountdown('2030-01-01T00:30:00Z', '2029-12-31T23:00:00Z'));
    expect(result.current.totalSeconds).toBe(5400);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.totalSeconds).toBe(5340);
  });

  it('clears its interval on unmount', () => {
    const { unmount } = renderHook(() => useCountdown('2030-01-01T01:00:00Z'));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
