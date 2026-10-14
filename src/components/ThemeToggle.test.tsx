import { screen } from '@testing-library/react';
import { mockMatchMedia } from '../test/matchMedia';
import { renderWithProviders } from '../test/utils';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('labels the current preference (system by default)', () => {
    renderWithProviders(<ThemeToggle />);
    const btn = screen.getByRole('button', { name: 'Theme: system' });
    expect(btn).toHaveAttribute('title', 'Theme: system (click to change)');
    expect(btn).toHaveTextContent('contrast');
  });

  it('cycles label/icon system -> light -> dark -> system', async () => {
    const { user } = renderWithProviders(<ThemeToggle />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: 'Theme: light' })).toHaveTextContent('light_mode');
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: 'Theme: dark' })).toHaveTextContent('dark_mode');
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: 'Theme: system' })).toBeInTheDocument();
  });

  it('applies the dark class when dark is selected and removes it afterwards', async () => {
    const { user } = renderWithProviders(<ThemeToggle />);
    await user.click(screen.getByRole('button')); // light
    await user.click(screen.getByRole('button')); // dark
    expect(document.documentElement).toHaveClass('dark');
    await user.click(screen.getByRole('button')); // system (OS light)
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('shows the stored preference on mount', () => {
    localStorage.setItem('theme', 'dark');
    renderWithProviders(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Theme: dark' })).toBeInTheDocument();
  });

  it('stays on "system" label but follows the OS when system + dark OS', () => {
    mockMatchMedia(true);
    renderWithProviders(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Theme: system' })).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('dark');
  });
});
