import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders its accessible label', () => {
    render(<Button>Continuar</Button>);
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
  });
});