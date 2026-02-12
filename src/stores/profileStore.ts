import { create } from 'zustand';
import { tauriInvoke } from '@/lib/tauri';
import type { Profile } from '@/types/profiles';
import type { Rule } from '@/types/rules';

interface ProfileState {
  profiles: Profile[];
  activeProfile: Profile | null;
  isLoading: boolean;
  error: string | null;

  fetchProfiles: () => Promise<void>;
  createProfile: (name: string, icon: string, color: string) => Promise<Profile>;
  activateProfile: (id: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  getProfileRules: (profileId: string) => Promise<Rule[]>;
  addRuleToProfile: (profileId: string, ruleId: string) => Promise<void>;
  removeRuleFromProfile: (profileId: string, ruleId: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>()((set) => ({
  profiles: [],
  activeProfile: null,
  isLoading: false,
  error: null,

  fetchProfiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const profiles = await tauriInvoke<Profile[]>('list_profiles');
      const activeProfile = profiles.find((p) => p.is_active) ?? null;
      set({ profiles, activeProfile, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },

  createProfile: async (name, icon, color) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await tauriInvoke<Profile>('create_profile', {
        name,
        icon,
        color,
      });
      set((state) => ({
        profiles: [...state.profiles, profile],
        isLoading: false,
      }));
      return profile;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  activateProfile: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await tauriInvoke('activate_profile', { id });
      set((state) => {
        const updatedProfiles = state.profiles.map((p) => ({
          ...p,
          is_active: p.id === id,
        }));
        const activeProfile = updatedProfiles.find((p) => p.is_active) ?? null;
        return { profiles: updatedProfiles, activeProfile, isLoading: false };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },

  deleteProfile: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await tauriInvoke('delete_profile', { id });
      set((state) => {
        const profiles = state.profiles.filter((p) => p.id !== id);
        const activeProfile =
          state.activeProfile?.id === id
            ? profiles.find((p) => p.is_active) ?? null
            : state.activeProfile;
        return { profiles, activeProfile, isLoading: false };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },

  getProfileRules: async (profileId) => {
    try {
      const rules = await tauriInvoke<Rule[]>('get_profile_rules', { profileId });
      return rules;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
      return [];
    }
  },

  addRuleToProfile: async (profileId, ruleId) => {
    try {
      await tauriInvoke('add_rule_to_profile', { profileId, ruleId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
      throw err;
    }
  },

  removeRuleFromProfile: async (profileId, ruleId) => {
    try {
      await tauriInvoke('remove_rule_from_profile', { profileId, ruleId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
      throw err;
    }
  },
}));
