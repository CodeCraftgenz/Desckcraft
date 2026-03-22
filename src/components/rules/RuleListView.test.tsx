import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/render';
import { RuleListView } from './RuleListView';
import { useRuleStore } from '@/stores/ruleStore';
import { setMockInvokeHandler, clearMockInvokeHandlers } from '@/test/setup';
import { createMockRules } from '@/test/fixtures';

describe('RuleListView', () => {
  beforeEach(() => {
    clearMockInvokeHandlers();
    useRuleStore.setState({
      rules: [],
      selectedRule: null,
      isLoading: false,
      error: null,
    });
  });

  it('should show empty state when no rules exist', async () => {
    setMockInvokeHandler('list_rules', () => []);
    render(<RuleListView />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma regra criada')).toBeInTheDocument();
    });
  });

  it('should render rule list after loading', async () => {
    const rules = createMockRules(3);
    setMockInvokeHandler('list_rules', () => rules);

    render(<RuleListView />);

    await waitFor(() => {
      expect(screen.getByText('Regra 1')).toBeInTheDocument();
      expect(screen.getByText('Regra 2')).toBeInTheDocument();
      expect(screen.getByText('Regra 3')).toBeInTheDocument();
    });
  });

  it('should show rule count in header', async () => {
    const rules = createMockRules(3);
    setMockInvokeHandler('list_rules', () => rules);

    render(<RuleListView />);

    await waitFor(() => {
      expect(screen.getByText('3 regras configuradas')).toBeInTheDocument();
    });
  });

  it('should show singular rule count', async () => {
    const rules = createMockRules(1);
    setMockInvokeHandler('list_rules', () => rules);

    render(<RuleListView />);

    await waitFor(() => {
      expect(screen.getByText('1 regra configurada')).toBeInTheDocument();
    });
  });

  it('should filter rules by search query', async () => {
    const rules = createMockRules(3);
    setMockInvokeHandler('list_rules', () => rules);

    render(<RuleListView />);

    await waitFor(() => {
      expect(screen.getByText('Regra 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar regras...');
    fireEvent.change(searchInput, { target: { value: 'Regra 1' } });

    expect(screen.getByText('Regra 1')).toBeInTheDocument();
    expect(screen.queryByText('Regra 2')).not.toBeInTheDocument();
  });

  it('should filter by enabled status', async () => {
    const rules = createMockRules(3); // rules 1 and 3 are enabled
    setMockInvokeHandler('list_rules', () => rules);

    render(<RuleListView />);

    await waitFor(() => {
      expect(screen.getByText('Regra 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Ativas'));

    expect(screen.getByText('Regra 1')).toBeInTheDocument();
    expect(screen.getByText('Regra 3')).toBeInTheDocument();
    expect(screen.queryByText('Regra 2')).not.toBeInTheDocument();
  });

  it('should filter by disabled status', async () => {
    const rules = createMockRules(3); // rule 2 is disabled
    setMockInvokeHandler('list_rules', () => rules);

    render(<RuleListView />);

    await waitFor(() => {
      expect(screen.getByText('Regra 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Inativas'));

    expect(screen.getByText('Regra 2')).toBeInTheDocument();
    expect(screen.queryByText('Regra 1')).not.toBeInTheDocument();
  });

  it('should show empty state when filter yields no results', async () => {
    const rules = createMockRules(3);
    setMockInvokeHandler('list_rules', () => rules);

    render(<RuleListView />);

    await waitFor(() => {
      expect(screen.getByText('Regra 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar regras...');
    fireEvent.change(searchInput, { target: { value: 'xyz-nonexistent' } });

    expect(screen.getByText('Nenhuma regra encontrada')).toBeInTheDocument();
  });

  it('should show "Nova Regra" button', async () => {
    setMockInvokeHandler('list_rules', () => []);
    render(<RuleListView />);

    expect(screen.getByText('Nova Regra')).toBeInTheDocument();
  });

  it('should show delete confirmation dialog', async () => {
    const rules = createMockRules(1);
    setMockInvokeHandler('list_rules', () => rules);

    render(<RuleListView />);

    await waitFor(() => {
      expect(screen.getByText('Regra 1')).toBeInTheDocument();
    });

    // The delete button has title "Excluir regra" - it may have opacity-0 but it's still in the DOM
    const deleteButton = screen.getByTitle('Excluir regra');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/Tem certeza que deseja excluir/)).toBeInTheDocument();
    });
  });

  it('should show loading skeletons', () => {
    setMockInvokeHandler('list_rules', () => new Promise(() => {})); // never resolves
    useRuleStore.setState({ isLoading: true });

    render(<RuleListView />);

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
