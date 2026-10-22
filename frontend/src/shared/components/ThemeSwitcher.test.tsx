import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeSwitcher } from './ThemeSwitcher';

describe('ThemeSwitcher', () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it('pins the chosen theme and remembers it', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(screen.getByRole('button', { name: 'Tema gelap' }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('insignia.theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Tema gelap' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('goes back to the system theme', async () => {
    const user = userEvent.setup();
    document.documentElement.dataset.theme = 'light';
    render(<ThemeSwitcher />);

    await user.click(screen.getByRole('button', { name: 'Ikuti sistem' }));

    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(localStorage.getItem('insignia.theme')).toBeNull();
  });
});
