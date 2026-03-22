import { describe, it, expect, beforeEach } from 'vitest';
import { useProfileStore } from './profileStore';
import { setMockInvokeHandler, clearMockInvokeHandlers } from '@/test/setup';
import { createMockProfile, createMockProfiles, createMockRules } from '@/test/fixtures';

describe('profileStore', () => {
  beforeEach(() => {
    clearMockInvokeHandlers();
    useProfileStore.setState({
      profiles: [],
      activeProfile: null,
      isLoading: false,
      error: null,
    });
  });

  describe('fetchProfiles', () => {
    it('should load profiles and identify active one', async () => {
      const profiles = createMockProfiles(3);
      setMockInvokeHandler('list_profiles', () => profiles);

      await useProfileStore.getState().fetchProfiles();

      const state = useProfileStore.getState();
      expect(state.profiles).toHaveLength(3);
      expect(state.activeProfile?.id).toBe('profile-1');
      expect(state.isLoading).toBe(false);
    });

    it('should handle no active profile', async () => {
      const profiles = [
        createMockProfile({ id: 'p1', is_active: false }),
      ];
      setMockInvokeHandler('list_profiles', () => profiles);

      await useProfileStore.getState().fetchProfiles();

      expect(useProfileStore.getState().activeProfile).toBeNull();
    });

    it('should set error on failure', async () => {
      setMockInvokeHandler('list_profiles', () => {
        throw new Error('DB error');
      });

      await useProfileStore.getState().fetchProfiles();

      const state = useProfileStore.getState();
      expect(state.error).toBe('DB error');
      expect(state.profiles).toHaveLength(0);
    });
  });

  describe('createProfile', () => {
    it('should create and add profile to list', async () => {
      const newProfile = createMockProfile({ id: 'new-1', name: 'Trabalho' });
      setMockInvokeHandler('create_profile', () => newProfile);

      const result = await useProfileStore.getState().createProfile('Trabalho', 'briefcase', 'blue');

      expect(result.id).toBe('new-1');
      expect(useProfileStore.getState().profiles).toHaveLength(1);
    });

    it('should throw on create error', async () => {
      setMockInvokeHandler('create_profile', () => {
        throw new Error('Create failed');
      });

      await expect(
        useProfileStore.getState().createProfile('Test', 'folder', 'indigo'),
      ).rejects.toThrow('Create failed');
    });
  });

  describe('activateProfile', () => {
    it('should set the active profile and deactivate others', async () => {
      const profiles = createMockProfiles(3);
      useProfileStore.setState({ profiles, activeProfile: profiles[0] });

      setMockInvokeHandler('activate_profile', () => undefined);

      await useProfileStore.getState().activateProfile('profile-2');

      const state = useProfileStore.getState();
      expect(state.activeProfile?.id).toBe('profile-2');
      expect(state.profiles.filter((p) => p.is_active)).toHaveLength(1);
      expect(state.profiles.find((p) => p.id === 'profile-2')?.is_active).toBe(true);
      expect(state.profiles.find((p) => p.id === 'profile-1')?.is_active).toBe(false);
    });
  });

  describe('deleteProfile', () => {
    it('should remove profile from list', async () => {
      const profiles = createMockProfiles(3);
      useProfileStore.setState({ profiles, activeProfile: profiles[0] });

      setMockInvokeHandler('delete_profile', () => undefined);

      await useProfileStore.getState().deleteProfile('profile-2');

      const state = useProfileStore.getState();
      expect(state.profiles).toHaveLength(2);
      expect(state.profiles.find((p) => p.id === 'profile-2')).toBeUndefined();
    });

    it('should clear activeProfile if deleted', async () => {
      const profiles = createMockProfiles(2);
      useProfileStore.setState({ profiles, activeProfile: profiles[0] });

      setMockInvokeHandler('delete_profile', () => undefined);

      await useProfileStore.getState().deleteProfile('profile-1');

      const state = useProfileStore.getState();
      // activeProfile should be null since the deleted profile was active
      // and the remaining profile is not active
      expect(state.activeProfile).toBeNull();
    });
  });

  describe('getProfileRules', () => {
    it('should return rules for a profile', async () => {
      const rules = createMockRules(2);
      setMockInvokeHandler('get_profile_rules', () => rules);

      const result = await useProfileStore.getState().getProfileRules('profile-1');

      expect(result).toHaveLength(2);
    });

    it('should return empty array on error', async () => {
      setMockInvokeHandler('get_profile_rules', () => {
        throw new Error('Failed');
      });

      const result = await useProfileStore.getState().getProfileRules('profile-1');

      expect(result).toHaveLength(0);
    });
  });

  describe('addRuleToProfile', () => {
    it('should call backend to add rule', async () => {
      let calledWith: unknown = null;
      setMockInvokeHandler('add_rule_to_profile', (args) => {
        calledWith = args;
      });

      await useProfileStore.getState().addRuleToProfile('p1', 'r1');

      expect(calledWith).toEqual({ profileId: 'p1', ruleId: 'r1' });
    });
  });

  describe('removeRuleFromProfile', () => {
    it('should call backend to remove rule', async () => {
      let calledWith: unknown = null;
      setMockInvokeHandler('remove_rule_from_profile', (args) => {
        calledWith = args;
      });

      await useProfileStore.getState().removeRuleFromProfile('p1', 'r1');

      expect(calledWith).toEqual({ profileId: 'p1', ruleId: 'r1' });
    });
  });
});
