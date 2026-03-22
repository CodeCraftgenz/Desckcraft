import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/render';
import { ProfileEditor } from './ProfileEditor';
import { useProfileStore } from '@/stores/profileStore';
import { useRuleStore } from '@/stores/ruleStore';
import { setMockInvokeHandler, clearMockInvokeHandlers } from '@/test/setup';
import { createMockProfile, createMockRules } from '@/test/fixtures';

describe('ProfileEditor', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    editingProfile: null as ReturnType<typeof createMockProfile> | null,
    onSaved: vi.fn(),
  };

  beforeEach(() => {
    clearMockInvokeHandlers();
    defaultProps.onClose = vi.fn();
    defaultProps.onSaved = vi.fn();
    defaultProps.editingProfile = null;
    useRuleStore.setState({ rules: createMockRules(3), isLoading: false });
    useProfileStore.setState({ profiles: [], activeProfile: null, isLoading: false });
    setMockInvokeHandler('list_rules', () => createMockRules(3));
    setMockInvokeHandler('get_profile_rules', () => []);
  });

  it('should show "Novo Perfil" title when creating', () => {
    render(<ProfileEditor {...defaultProps} />);
    expect(screen.getByText('Novo Perfil')).toBeInTheDocument();
  });

  it('should show "Editar Perfil" title when editing', () => {
    const profile = createMockProfile();
    render(<ProfileEditor {...defaultProps} editingProfile={profile} />);
    expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
  });

  it('should show name input', () => {
    render(<ProfileEditor {...defaultProps} />);
    expect(screen.getByPlaceholderText('Ex: Trabalho, Projetos, Estudos...')).toBeInTheDocument();
  });

  it('should show icon selector', () => {
    render(<ProfileEditor {...defaultProps} />);
    expect(screen.getByText('Ícone')).toBeInTheDocument();
  });

  it('should show color picker', () => {
    render(<ProfileEditor {...defaultProps} />);
    expect(screen.getByText('Cor')).toBeInTheDocument();
  });

  it('should show available rules', () => {
    render(<ProfileEditor {...defaultProps} />);
    expect(screen.getByText('Regras associadas')).toBeInTheDocument();
    expect(screen.getByText('Regra 1')).toBeInTheDocument();
    expect(screen.getByText('Regra 2')).toBeInTheDocument();
  });

  it('should validate empty name on save', async () => {
    render(<ProfileEditor {...defaultProps} />);
    fireEvent.click(screen.getByText('Criar Perfil'));

    await waitFor(() => {
      expect(screen.getByText('O nome do perfil é obrigatório')).toBeInTheDocument();
    });
  });

  it('should show "Salvar" button when editing', () => {
    const profile = createMockProfile();
    render(<ProfileEditor {...defaultProps} editingProfile={profile} />);
    expect(screen.getByText('Salvar')).toBeInTheDocument();
  });

  it('should show Cancelar button', () => {
    render(<ProfileEditor {...defaultProps} />);
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', () => {
    render(<ProfileEditor {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should disable name when editing', () => {
    const profile = createMockProfile();
    render(<ProfileEditor {...defaultProps} editingProfile={profile} />);

    const nameInput = screen.getByPlaceholderText('Ex: Trabalho, Projetos, Estudos...');
    expect(nameInput).toBeDisabled();
  });

  it('should show "Nenhuma regra disponível" when no rules exist', () => {
    useRuleStore.setState({ rules: [], isLoading: false });
    render(<ProfileEditor {...defaultProps} />);

    expect(screen.getByText('Nenhuma regra disponível. Crie regras primeiro.')).toBeInTheDocument();
  });

  it('should show disabled badge for disabled rules', () => {
    // Rule 2 is disabled in createMockRules
    render(<ProfileEditor {...defaultProps} />);
    expect(screen.getByText('Desativada')).toBeInTheDocument();
  });

  it('should create profile successfully', async () => {
    const newProfile = createMockProfile({ id: 'new-1', name: 'Trabalho' });
    setMockInvokeHandler('create_profile', () => newProfile);

    render(<ProfileEditor {...defaultProps} />);

    const nameInput = screen.getByPlaceholderText('Ex: Trabalho, Projetos, Estudos...');
    fireEvent.change(nameInput, { target: { value: 'Trabalho' } });
    fireEvent.click(screen.getByText('Criar Perfil'));

    await waitFor(() => {
      expect(defaultProps.onSaved).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('should toggle rule checkbox', () => {
    render(<ProfileEditor {...defaultProps} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(3); // 3 rules
    fireEvent.click(checkboxes[0]);

    // After clicking, the text should update
    expect(screen.getByText(/1 regra.*selecionada/)).toBeInTheDocument();
  });
});
