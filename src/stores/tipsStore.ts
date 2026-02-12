import { create } from 'zustand';
import { tauriInvoke } from '@/lib/tauri';
import type { TipSuggestion } from '@/types/tips';

/* ---------- Mock / Fallback Tips ---------- */

const MOCK_TIPS: TipSuggestion[] = [
  {
    id: 'desktop_clutter',
    title: 'Seu Desktop tem muitos itens',
    message:
      'Identificamos mais de 30 arquivos no seu Desktop. Quer ativar a organização automática para manter tudo limpo?',
    action_label: 'Ativar organização',
    action_type: 'create_rule',
  },
  {
    id: 'pdf_accumulation',
    title: 'PDFs acumulados',
    message:
      'Você tem vários PDFs espalhados. Que tal criar uma regra para organizar PDFs automaticamente na pasta Documentos/PDFs?',
    action_label: 'Criar regra para PDFs',
    action_type: 'create_rule',
  },
  {
    id: 'installer_pileup',
    title: 'Instaladores ocupando espaço',
    message:
      'Detectamos instaladores (.exe, .msi) acumulados. Quer mover instaladores antigos para uma pasta dedicada?',
    action_label: 'Organizar instaladores',
    action_type: 'create_rule',
  },
];

/* ---------- Dismissed Tips Tracking (localStorage) ---------- */

const DISMISSED_KEY = 'deskcraft_dismissed_tips';

interface DismissedEntry {
  tipId: string;
  dismissedAt: number;
  cooldownUntil: number;
}

function getDismissedTips(): DismissedEntry[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DismissedEntry[];
  } catch {
    return [];
  }
}

function saveDismissedTips(entries: DismissedEntry[]): void {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(entries));
}

function isDismissed(tipId: string): boolean {
  const entries = getDismissedTips();
  const entry = entries.find((e) => e.tipId === tipId);
  if (!entry) return false;
  // If cooldown has expired, it's no longer dismissed
  if (Date.now() > entry.cooldownUntil) return false;
  return true;
}

function addDismissed(tipId: string, cooldownMs: number = 24 * 60 * 60 * 1000): void {
  const entries = getDismissedTips().filter((e) => e.tipId !== tipId);
  entries.push({
    tipId,
    dismissedAt: Date.now(),
    cooldownUntil: Date.now() + cooldownMs,
  });
  saveDismissedTips(entries);
}

function clearAllDismissed(): void {
  localStorage.removeItem(DISMISSED_KEY);
}

/* ---------- Accepted Tips Tracking (localStorage) ---------- */

const ACCEPTED_KEY = 'deskcraft_accepted_tips';

function getAcceptedTips(): string[] {
  try {
    const raw = localStorage.getItem(ACCEPTED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveAcceptedTip(tipId: string): void {
  const accepted = getAcceptedTips();
  if (!accepted.includes(tipId)) {
    accepted.push(tipId);
    localStorage.setItem(ACCEPTED_KEY, JSON.stringify(accepted));
  }
}

/* ---------- Store ---------- */

interface TipsState {
  tips: TipSuggestion[];
  isLoading: boolean;
  error: string | null;

  evaluateTips: (folderPath?: string) => Promise<void>;
  acceptTip: (tipId: string) => Promise<void>;
  dismissTip: (tipId: string) => Promise<void>;
  resetDismissedTips: () => void;
}

export const useTipsStore = create<TipsState>()((set, get) => ({
  tips: [],
  isLoading: false,
  error: null,

  evaluateTips: async (folderPath) => {
    set({ isLoading: true, error: null });
    try {
      const tips = await tauriInvoke<TipSuggestion[]>('evaluate_tips', {
        folderPath: folderPath ?? '',
      });
      // Filter out dismissed and accepted tips
      const acceptedIds = getAcceptedTips();
      const filtered = tips.filter(
        (t) => !isDismissed(t.id) && !acceptedIds.includes(t.id),
      );
      set({ tips: filtered, isLoading: false });
    } catch {
      // Fallback: use mock tips when Tauri backend is not available
      const acceptedIds = getAcceptedTips();
      const filtered = MOCK_TIPS.filter(
        (t) => !isDismissed(t.id) && !acceptedIds.includes(t.id),
      );
      set({ tips: filtered, isLoading: false, error: null });
    }
  },

  acceptTip: async (tipId) => {
    set({ error: null });
    // Remove from local list immediately
    set((state) => ({
      tips: state.tips.filter((t) => t.id !== tipId),
    }));
    // Persist acceptance
    saveAcceptedTip(tipId);
    try {
      await tauriInvoke('accept_tip', { tipId });
    } catch {
      // Gracefully handle when backend is not available
    }
  },

  dismissTip: async (tipId) => {
    set({ error: null });
    // Remove from local list immediately
    set((state) => ({
      tips: state.tips.filter((t) => t.id !== tipId),
    }));
    // Persist dismissal with 24h cooldown
    addDismissed(tipId, 24 * 60 * 60 * 1000);
    try {
      await tauriInvoke('dismiss_tip', { tipId });
    } catch {
      // Gracefully handle when backend is not available
    }
  },

  resetDismissedTips: () => {
    clearAllDismissed();
    // Re-evaluate tips to show dismissed ones again
    get().evaluateTips();
  },
}));
