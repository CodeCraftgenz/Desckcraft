import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Folder,
  Briefcase,
  BookOpen,
  Code2,
  Music,
  Image,
  Film,
  Gamepad2,
  Heart,
  Star,
  Home,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useProfileStore, useRuleStore } from '@/stores';
import { useToast } from '@/components/ui/Toast';
import type { Profile } from '@/types/profiles';
import type { Rule } from '@/types/rules';

/* ---------- Icon definitions ---------- */

const ICON_OPTIONS: { key: string; icon: LucideIcon; label: string }[] = [
  { key: 'folder', icon: Folder, label: 'Pasta' },
  { key: 'briefcase', icon: Briefcase, label: 'Trabalho' },
  { key: 'book', icon: BookOpen, label: 'Livro' },
  { key: 'code', icon: Code2, label: 'Código' },
  { key: 'music', icon: Music, label: 'Música' },
  { key: 'image', icon: Image, label: 'Imagem' },
  { key: 'film', icon: Film, label: 'Vídeo' },
  { key: 'gamepad', icon: Gamepad2, label: 'Jogos' },
  { key: 'heart', icon: Heart, label: 'Favoritos' },
  { key: 'star', icon: Star, label: 'Destaque' },
  { key: 'home', icon: Home, label: 'Pessoal' },
  { key: 'globe', icon: Globe, label: 'Web' },
];

/* ---------- Color definitions ---------- */

const COLOR_OPTIONS: { key: string; className: string; label: string }[] = [
  { key: 'indigo', className: 'bg-indigo-500', label: 'Indigo' },
  { key: 'blue', className: 'bg-blue-500', label: 'Azul' },
  { key: 'green', className: 'bg-green-500', label: 'Verde' },
  { key: 'emerald', className: 'bg-emerald-500', label: 'Esmeralda' },
  { key: 'amber', className: 'bg-amber-500', label: 'Âmbar' },
  { key: 'orange', className: 'bg-orange-500', label: 'Laranja' },
  { key: 'red', className: 'bg-red-500', label: 'Vermelho' },
  { key: 'pink', className: 'bg-pink-500', label: 'Rosa' },
];

/* ---------- Props ---------- */

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  editingProfile: Profile | null;
  onSaved: () => void;
}

/* ---------- Component ---------- */

export function ProfileEditor({
  isOpen,
  onClose,
  editingProfile,
  onSaved,
}: ProfileEditorProps) {
  const toast = useToast();
  const createProfile = useProfileStore((s) => s.createProfile);
  const getProfileRules = useProfileStore((s) => s.getProfileRules);
  const addRuleToProfile = useProfileStore((s) => s.addRuleToProfile);
  const removeRuleFromProfile = useProfileStore((s) => s.removeRuleFromProfile);
  const allRules = useRuleStore((s) => s.rules);
  const fetchRules = useRuleStore((s) => s.fetchRules);

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [assignedRuleIds, setAssignedRuleIds] = useState<Set<string>>(new Set());
  const [originalRuleIds, setOriginalRuleIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const isEditing = editingProfile !== null;

  /* Load data on open */
  const loadData = useCallback(async () => {
    // Ensure rules are loaded
    if (allRules.length === 0) {
      await fetchRules();
    }

    if (editingProfile) {
      setName(editingProfile.name);
      setSelectedIcon(editingProfile.icon);
      setSelectedColor(editingProfile.color);

      // Load assigned rules
      const profileRules = await getProfileRules(editingProfile.id);
      const ruleIdSet = new Set(profileRules.map((r: Rule) => r.id));
      setAssignedRuleIds(ruleIdSet);
      setOriginalRuleIds(new Set(ruleIdSet));
    } else {
      setName('');
      setSelectedIcon('folder');
      setSelectedColor('indigo');
      setAssignedRuleIds(new Set());
      setOriginalRuleIds(new Set());
    }
    setNameError('');
  }, [editingProfile, allRules.length, fetchRules, getProfileRules]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  /* Toggle rule assignment */
  const toggleRule = (ruleId: string) => {
    setAssignedRuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return next;
    });
  };

  /* Save handler */
  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('O nome do perfil é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      let profileId: string;

      if (isEditing) {
        // For editing, we cannot update name/icon/color since there is no update_profile backend command.
        // We handle rule assignments only.
        profileId = editingProfile.id;
      } else {
        // Create new profile
        const created = await createProfile(trimmed, selectedIcon, selectedColor);
        profileId = created.id;
      }

      // Sync rule assignments
      // Rules to add: in assignedRuleIds but not in originalRuleIds
      const toAdd = [...assignedRuleIds].filter((id) => !originalRuleIds.has(id));
      // Rules to remove: in originalRuleIds but not in assignedRuleIds
      const toRemove = [...originalRuleIds].filter((id) => !assignedRuleIds.has(id));

      await Promise.all([
        ...toAdd.map((ruleId) => addRuleToProfile(profileId, ruleId)),
        ...toRemove.map((ruleId) => removeRuleFromProfile(profileId, ruleId)),
      ]);

      toast.success(
        isEditing
          ? `Perfil "${editingProfile.name}" atualizado com sucesso`
          : `Perfil "${trimmed}" criado com sucesso`,
      );

      onSaved();
      onClose();
    } catch {
      toast.error('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Perfil' : 'Novo Perfil'}
      size="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        {/* Name input */}
        <Input
          label="Nome do perfil"
          placeholder="Ex: Trabalho, Projetos, Estudos..."
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError('');
          }}
          error={nameError}
          disabled={isEditing}
        />

        {/* Icon selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ícone
          </label>
          <div className="grid grid-cols-6 gap-2">
            {ICON_OPTIONS.map(({ key, icon: Icon, label }) => (
              <motion.button
                key={key}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => !isEditing && setSelectedIcon(key)}
                disabled={isEditing}
                title={label}
                className={`
                  relative flex items-center justify-center p-3 rounded-lg
                  transition-colors duration-150
                  ${isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${
                    selectedIcon === key
                      ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon size={20} />
                {selectedIcon === key && (
                  <motion.div
                    layoutId="icon-check"
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center"
                  >
                    <Check size={10} className="text-white" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cor
          </label>
          <div className="flex items-center gap-3">
            {COLOR_OPTIONS.map(({ key, className, label }) => (
              <motion.button
                key={key}
                type="button"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => !isEditing && setSelectedColor(key)}
                disabled={isEditing}
                title={label}
                className={`
                  relative w-8 h-8 rounded-full ${className}
                  transition-all duration-150
                  ${isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${
                    selectedColor === key
                      ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-gray-900 dark:ring-white scale-110'
                      : 'hover:ring-2 hover:ring-offset-2 hover:ring-offset-white dark:hover:ring-offset-gray-900 hover:ring-gray-300 dark:hover:ring-gray-600'
                  }
                `}
              >
                {selectedColor === key && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Check size={14} className="text-white drop-shadow" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Rule assignment */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Regras associadas
          </label>
          {allRules.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 py-3 text-center">
              Nenhuma regra disponível. Crie regras primeiro.
            </p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800 p-2">
              {allRules.map((rule) => {
                const isAssigned = assignedRuleIds.has(rule.id);
                return (
                  <label
                    key={rule.id}
                    className={`
                      flex items-center gap-3 p-2.5 rounded-lg cursor-pointer
                      transition-colors duration-100
                      ${
                        isAssigned
                          ? 'bg-brand-50 dark:bg-brand-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isAssigned}
                      onChange={() => toggleRule(rule.id)}
                      className="
                        w-4 h-4 rounded border-gray-300 dark:border-gray-600
                        text-brand-600 focus:ring-brand-500
                        dark:bg-gray-800
                      "
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {rule.name}
                      </p>
                      {rule.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {rule.description}
                        </p>
                      )}
                    </div>
                    {!rule.is_enabled && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium shrink-0">
                        Desativada
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {assignedRuleIds.size === 0
              ? 'Selecione regras para associar a este perfil'
              : `${assignedRuleIds.size} regra${assignedRuleIds.size > 1 ? 's' : ''} selecionada${assignedRuleIds.size > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button variant="ghost" size="md" onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          loading={isSaving}
        >
          {isEditing ? 'Salvar' : 'Criar Perfil'}
        </Button>
      </div>
    </Dialog>
  );
}
