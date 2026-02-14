import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProfileCard } from './ProfileCard';
import { ProfileEditor } from './ProfileEditor';
import { useProfileStore, useRuleStore } from '@/stores';
import { useToast } from '@/components/ui/Toast';
import type { Profile } from '@/types/profiles';

/* ---------- Animation variants ---------- */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

/* ---------- Component ---------- */

export function ProfileListView() {
  const toast = useToast();

  /* Store state */
  const profiles = useProfileStore((s) => s.profiles);
  const isLoading = useProfileStore((s) => s.isLoading);
  const fetchProfiles = useProfileStore((s) => s.fetchProfiles);
  const activateProfile = useProfileStore((s) => s.activateProfile);
  const deleteProfile = useProfileStore((s) => s.deleteProfile);
  const getProfileRules = useProfileStore((s) => s.getProfileRules);
  const fetchRules = useRuleStore((s) => s.fetchRules);

  /* Local state */
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [ruleCounts, setRuleCounts] = useState<Record<string, number>>({});

  /* Load rule counts for all profiles */
  const loadRuleCounts = useCallback(async () => {
    const counts: Record<string, number> = {};
    await Promise.all(
      profiles.map(async (profile) => {
        const rules = await getProfileRules(profile.id);
        counts[profile.id] = rules.length;
      }),
    );
    setRuleCounts(counts);
  }, [profiles, getProfileRules]);

  /* Initial load */
  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  useEffect(() => {
    if (profiles.length > 0) {
      loadRuleCounts();
    }
  }, [profiles, loadRuleCounts]);

  /* Handlers */
  const handleCreateNew = () => {
    setEditingProfile(null);
    setEditorOpen(true);
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setEditorOpen(true);
  };

  const handleActivate = async (profile: Profile) => {
    try {
      await activateProfile(profile.id);
      toast.success(`Perfil "${profile.name}" ativado`);
    } catch {
      toast.error('Erro ao ativar perfil');
    }
  };

  const handleDeleteRequest = (profile: Profile) => {
    if (profile.is_default) {
      toast.error('O perfil padrão não pode ser excluído');
      return;
    }
    setProfileToDelete(profile);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!profileToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProfile(profileToDelete.id);
      toast.success(`Perfil "${profileToDelete.name}" excluído`);
      setDeleteConfirmOpen(false);
      setProfileToDelete(null);
    } catch {
      toast.error('Erro ao excluir perfil');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditorSaved = () => {
    fetchProfiles();
    // Rule counts will refresh via the profiles useEffect
  };

  /* Empty state */
  if (!isLoading && profiles.length === 0) {
    return (
      <>
        <EmptyState
          icon={Users}
          title="Nenhum perfil encontrado"
          description="Crie perfis para organizar regras por contexto. Cada perfil pode conter um conjunto diferente de regras."
          action={{ label: 'Novo Perfil', onClick: handleCreateNew }}
        />
        <ProfileEditor
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          editingProfile={null}
          onSaved={handleEditorSaved}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20">
            <Users size={20} className="text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Perfis
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {profiles.length === 1
                ? '1 perfil'
                : `${profiles.length} perfis`}
            </p>
          </div>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleCreateNew}>
          Novo Perfil
        </Button>
      </div>

      {/* Profile grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {profiles.map((profile) => (
            <motion.div key={profile.id} variants={itemVariants} layout>
              <ProfileCard
                profile={profile}
                ruleCount={ruleCounts[profile.id] ?? 0}
                isActive={profile.is_active}
                onActivate={() => handleActivate(profile)}
                onEdit={() => handleEdit(profile)}
                onDelete={() => handleDeleteRequest(profile)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Profile Editor Dialog */}
      <ProfileEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        editingProfile={editingProfile}
        onSaved={handleEditorSaved}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setProfileToDelete(null);
        }}
        title="Excluir Perfil"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 shrink-0">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Tem certeza que deseja excluir o perfil{' '}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  "{profileToDelete?.name}"
                </span>
                ?
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Esta ação não pode ser desfeita. As regras associadas não serão excluídas.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setProfileToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              loading={isDeleting}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
