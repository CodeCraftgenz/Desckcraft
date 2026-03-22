import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/render';
import { Switch } from './Switch';

describe('Switch', () => {
  it('should render unchecked by default', () => {
    render(<Switch checked={false} onChange={vi.fn()} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('should render checked state', () => {
    render(<Switch checked={true} onChange={vi.fn()} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('should call onChange with opposite value on click', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} />);

    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should toggle from checked to unchecked', () => {
    const onChange = vi.fn();
    render(<Switch checked={true} onChange={onChange} />);

    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('should not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} disabled={true} />);

    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should toggle on Enter key', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole('switch'), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should toggle on Space key', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole('switch'), { key: ' ' });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should render label when provided', () => {
    render(<Switch checked={false} onChange={vi.fn()} label="Ativar regra" />);
    expect(screen.getByText('Ativar regra')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(
      <Switch
        checked={false}
        onChange={vi.fn()}
        label="Ativar"
        description="Ativa esta funcionalidade"
      />,
    );
    expect(screen.getByText('Ativa esta funcionalidade')).toBeInTheDocument();
  });

  it('should toggle when label text is clicked', () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} label="Ativar" />);

    fireEvent.click(screen.getByText('Ativar'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should have disabled styling when disabled', () => {
    render(<Switch checked={false} onChange={vi.fn()} disabled={true} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeDisabled();
  });
});
