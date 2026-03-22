import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/render';
import { ConditionRow, type ConditionRowData } from './ConditionRow';

function createCondition(overrides: Partial<ConditionRowData> = {}): ConditionRowData {
  return {
    id: 'cond-1',
    field: 'extension',
    operator: 'equals',
    value: '',
    logic_gate: 'AND',
    ...overrides,
  };
}

describe('ConditionRow', () => {
  const defaultProps = {
    index: 0,
    isFirst: true,
    onChange: vi.fn(),
    onDelete: vi.fn(),
    onToggleLogicGate: vi.fn(),
  };

  it('should render field, operator, and value inputs', () => {
    const condition = createCondition();
    render(<ConditionRow condition={condition} {...defaultProps} />);

    // Should have row number
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should show extension presets when field is extension', () => {
    const condition = createCondition({ field: 'extension' });
    render(<ConditionRow condition={condition} {...defaultProps} />);

    expect(screen.getByText('Imagens')).toBeInTheDocument();
    expect(screen.getByText('Documentos')).toBeInTheDocument();
    expect(screen.getByText('Videos')).toBeInTheDocument();
    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByText('Compactados')).toBeInTheDocument();
    expect(screen.getByText('Codigo')).toBeInTheDocument();
  });

  it('should not show extension presets for non-extension fields', () => {
    const condition = createCondition({ field: 'filename' });
    render(<ConditionRow condition={condition} {...defaultProps} />);

    expect(screen.queryByText('Imagens')).not.toBeInTheDocument();
  });

  it('should fill value when extension preset is clicked', () => {
    const onChange = vi.fn();
    const condition = createCondition({ field: 'extension' });
    render(<ConditionRow condition={condition} {...defaultProps} onChange={onChange} />);

    fireEvent.click(screen.getByText('Imagens'));

    expect(onChange).toHaveBeenCalledWith('cond-1', {
      value: 'jpg,jpeg,png,gif,bmp,webp,svg,ico,tiff',
    });
  });

  it('should show date presets when field is modified_date', () => {
    const condition = createCondition({ field: 'modified_date' });
    render(<ConditionRow condition={condition} {...defaultProps} />);

    expect(screen.getByText('Arquivar antes de:')).toBeInTheDocument();
  });

  it('should show date presets when field is created_date', () => {
    const condition = createCondition({ field: 'created_date' });
    render(<ConditionRow condition={condition} {...defaultProps} />);

    expect(screen.getByText('Arquivar antes de:')).toBeInTheDocument();
  });

  it('should not show date presets for non-date fields', () => {
    const condition = createCondition({ field: 'extension' });
    render(<ConditionRow condition={condition} {...defaultProps} />);

    expect(screen.queryByText('Arquivar antes de:')).not.toBeInTheDocument();
  });

  it('should show logic gate button when not first row', () => {
    const condition = createCondition({ logic_gate: 'AND' });
    render(<ConditionRow condition={condition} {...defaultProps} isFirst={false} />);

    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('should not show logic gate button for first row', () => {
    const condition = createCondition({ logic_gate: 'AND' });
    render(<ConditionRow condition={condition} {...defaultProps} isFirst={true} />);

    expect(screen.queryByText('E')).not.toBeInTheDocument();
  });

  it('should toggle logic gate on click', () => {
    const onToggleLogicGate = vi.fn();
    const condition = createCondition({ logic_gate: 'AND' });
    render(
      <ConditionRow
        condition={condition}
        {...defaultProps}
        isFirst={false}
        onToggleLogicGate={onToggleLogicGate}
      />,
    );

    fireEvent.click(screen.getByText('E'));
    expect(onToggleLogicGate).toHaveBeenCalledWith('cond-1');
  });

  it('should show OR when logic gate is OR', () => {
    const condition = createCondition({ logic_gate: 'OR' });
    render(<ConditionRow condition={condition} {...defaultProps} isFirst={false} />);

    expect(screen.getByText('OU')).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    const condition = createCondition();
    render(<ConditionRow condition={condition} {...defaultProps} onDelete={onDelete} />);

    const deleteButton = screen.getByTitle('Remover condição');
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith('cond-1');
  });

  it('should highlight active extension preset', () => {
    const condition = createCondition({
      field: 'extension',
      value: 'jpg,jpeg,png,gif,bmp,webp,svg,ico,tiff',
    });
    render(<ConditionRow condition={condition} {...defaultProps} />);

    const imagensButton = screen.getByText('Imagens');
    expect(imagensButton.className).toContain('bg-indigo-50');
  });
});
