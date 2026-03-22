import type { Rule } from '@/types/rules';
import type { Profile } from '@/types/profiles';

export function createMockRule(overrides: Partial<Rule> = {}): Rule {
  return {
    id: 'rule-1',
    name: 'Organizar Imagens',
    description: 'Move imagens para pasta de fotos',
    is_enabled: true,
    priority: 0,
    sort_order: 0,
    created_at: '2025-01-01 00:00:00',
    updated_at: '2025-01-01 00:00:00',
    ...overrides,
  };
}

export function createMockRules(count: number = 3): Rule[] {
  return Array.from({ length: count }, (_, i) =>
    createMockRule({
      id: `rule-${i + 1}`,
      name: `Regra ${i + 1}`,
      description: `Descrição da regra ${i + 1}`,
      is_enabled: i % 2 === 0,
      sort_order: i,
      priority: i,
    }),
  );
}

export function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'profile-1',
    name: 'Pessoal',
    icon: 'home',
    color: 'indigo',
    is_active: true,
    is_default: true,
    created_at: '2025-01-01 00:00:00',
    updated_at: '2025-01-01 00:00:00',
    ...overrides,
  };
}

export function createMockProfiles(count: number = 3): Profile[] {
  return Array.from({ length: count }, (_, i) =>
    createMockProfile({
      id: `profile-${i + 1}`,
      name: `Perfil ${i + 1}`,
      icon: i === 0 ? 'home' : i === 1 ? 'briefcase' : 'code',
      color: i === 0 ? 'indigo' : i === 1 ? 'blue' : 'green',
      is_active: i === 0,
      is_default: i === 0,
    }),
  );
}
