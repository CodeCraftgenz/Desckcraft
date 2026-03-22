import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/render';
import { ProfileListView } from './ProfileListView';
import { useProfileStore } from '@/stores/profileStore';
import { useRuleStore } from '@/stores/ruleStore';
import { setMockInvokeHandler, clearMockInvokeHandlers } from '@/test/setup';
import { createMockProfiles, createMockRules } from '@/test/fixtures';

describe('ProfileListView', () => {
  beforeEach(() => {
    clearMockInvokeHandlers();
    useProfileStore.setState({
      profiles: [],
      activeProfile: null,
      isLoading: false,
      error: null,
    });
    useRuleStore.setState({
      rules: [],
      selectedRule: null,
      isLoading: false,
      error: null,
    });
    // Default handlers
    setMockInvokeHandler('list_rules', () => []);
    setMockInvokeHandler('get_profile_rules', () => []);
  });

  it('should show empty state when no profiles exist', () => {
    render(<ProfileListView />);
    expect(screen.getByText('Nenhum perfil encontrado')).toBeInTheDocument();
  });

  it('should render profile cards', async () => {
    const profiles = createMockProfiles(3);
    useProfileStore.setState({ profiles, activeProfile: profiles[0], isLoading: false });

    render(<ProfileListView />);

    expect(screen.getByText('Perfil 1')).toBeInTheDocument();
    expect(screen.getByText('Perfil 2')).toBeInTheDocument();
    expect(screen.getByText('Perfil 3')).toBeInTheDocument();
  });

  it('should show profile count', () => {
    const profiles = createMockProfiles(3);
    useProfileStore.setState({ profiles, activeProfile: profiles[0], isLoading: false });

    render(<ProfileListView />);

    expect(screen.getByText('3 perfis')).toBeInTheDocument();
  });

  it('should show active badge on active profile', () => {
    const profiles = createMockProfiles(2);
    useProfileStore.setState({ profiles, activeProfile: profiles[0], isLoading: false });

    render(<ProfileListView />);

    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('should show "Novo Perfil" button', () => {
    const profiles = createMockProfiles(1);
    useProfileStore.setState({ profiles, activeProfile: profiles[0], isLoading: false });

    render(<ProfileListView />);

    expect(screen.getByText('Novo Perfil')).toBeInTheDocument();
  });

  it('should show delete confirmation when delete is clicked', async () => {
    const profiles = createMockProfiles(2);
    profiles[1].is_default = false;
    useProfileStore.setState({ profiles, activeProfile: profiles[0], isLoading: false });

    render(<ProfileListView />);

    const deleteButtons = screen.getAllByLabelText('Excluir perfil');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Excluir Perfil')).toBeInTheDocument();
    });
  });

  it('should prevent deleting default profile', () => {
    const profiles = createMockProfiles(1); // profile-1 is default
    useProfileStore.setState({ profiles, activeProfile: profiles[0], isLoading: false });

    render(<ProfileListView />);

    // Default profile should not have delete button
    expect(screen.queryByLabelText('Excluir perfil')).not.toBeInTheDocument();
  });

  it('should show rule count on profile cards', async () => {
    const profiles = createMockProfiles(1);
    const rules = createMockRules(3);
    setMockInvokeHandler('get_profile_rules', () => rules);

    useProfileStore.setState({ profiles, activeProfile: profiles[0], isLoading: false });

    render(<ProfileListView />);

    await waitFor(() => {
      expect(screen.getByText('3 regras associadas')).toBeInTheDocument();
    });
  });

  it('should show "Nenhuma regra" when profile has no rules', async () => {
    const profiles = createMockProfiles(1);
    setMockInvokeHandler('get_profile_rules', () => []);

    useProfileStore.setState({ profiles, activeProfile: profiles[0], isLoading: false });

    render(<ProfileListView />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma regra')).toBeInTheDocument();
    });
  });
});
