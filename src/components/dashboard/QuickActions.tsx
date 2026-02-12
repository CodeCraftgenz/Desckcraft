import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, FlaskConical, UserCircle, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppStore, useProfileStore } from '@/stores';
import { VIEWS } from '@/lib/constants';
import type { Profile } from '@/types/profiles';

/* ---------- Profile Dropdown ---------- */

interface ProfileDropdownProps {
  profiles: Profile[];
  activeProfile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

function ProfileDropdown({
  profiles,
  activeProfile,
  isOpen,
  onClose,
  onSelect,
}: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="
            absolute top-full left-0 mt-2 z-50
            w-56 py-1 rounded-lg
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            shadow-lg shadow-gray-200/50 dark:shadow-black/30
          "
        >
          {profiles.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              Nenhum perfil criado
            </div>
          ) : (
            profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => {
                  onSelect(profile.id);
                  onClose();
                }}
                className="
                  w-full flex items-center gap-3 px-3 py-2 text-left
                  text-sm text-gray-700 dark:text-gray-300
                  hover:bg-gray-50 dark:hover:bg-gray-800
                  transition-colors duration-100
                "
              >
                <span className="text-base">{profile.icon || '📁'}</span>
                <span className="flex-1 truncate">{profile.name}</span>
                {activeProfile?.id === profile.id && (
                  <Check size={14} className="shrink-0 text-brand-600 dark:text-brand-400" />
                )}
              </button>
            ))
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Main Component ---------- */

/**
 * QuickActions renders a row of prominent action buttons on the dashboard.
 * Includes "Organizar Agora", "Simular", and a profile switcher dropdown.
 */
export function QuickActions() {
  const setView = useAppStore((s) => s.setView);
  const profiles = useProfileStore((s) => s.profiles);
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const activateProfile = useProfileStore((s) => s.activateProfile);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleOrganize = () => {
    setView(VIEWS.EXECUTION);
  };

  const handleSimulate = () => {
    setView(VIEWS.SIMULATION);
  };

  const handleSelectProfile = async (id: string) => {
    await activateProfile(id);
  };

  return (
    <div data-tour="dashboard-actions" className="flex flex-wrap items-center gap-3">
      {/* Primary: Organizar Agora */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
      >
        <Button
          variant="primary"
          size="lg"
          icon={Play}
          onClick={handleOrganize}
          className="shadow-md shadow-brand-600/20 dark:shadow-brand-500/10"
        >
          Organizar Agora
        </Button>
      </motion.div>

      {/* Secondary: Simular */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
      >
        <Button
          variant="secondary"
          size="md"
          icon={FlaskConical}
          onClick={handleSimulate}
          data-tour="simulate-btn"
        >
          Simular
        </Button>
      </motion.div>

      {/* Secondary: Trocar Perfil with dropdown */}
      <div className="relative">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
        >
          <Button
            variant="secondary"
            size="md"
            icon={UserCircle}
            onClick={() => setShowProfileMenu((v) => !v)}
            className="pr-3"
          >
            <span className="flex items-center gap-1.5">
              {activeProfile?.name || 'Trocar Perfil'}
              <ChevronDown
                size={14}
                className={`
                  transition-transform duration-200
                  ${showProfileMenu ? 'rotate-180' : ''}
                `}
              />
            </span>
          </Button>
        </motion.div>

        <ProfileDropdown
          profiles={profiles}
          activeProfile={activeProfile}
          isOpen={showProfileMenu}
          onClose={() => setShowProfileMenu(false)}
          onSelect={handleSelectProfile}
        />
      </div>
    </div>
  );
}
