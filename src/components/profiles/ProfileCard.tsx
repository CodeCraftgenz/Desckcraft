import { motion } from 'framer-motion';
import {
  Zap,
  Pencil,
  Trash2,
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
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Profile } from '@/types/profiles';

/* ---------- Icon map ---------- */

export const PROFILE_ICONS: Record<string, LucideIcon> = {
  folder: Folder,
  briefcase: Briefcase,
  book: BookOpen,
  code: Code2,
  music: Music,
  image: Image,
  film: Film,
  gamepad: Gamepad2,
  heart: Heart,
  star: Star,
  home: Home,
  globe: Globe,
};

/* ---------- Color map ---------- */

export const PROFILE_COLORS: Record<string, { bg: string; gradient: string; border: string; text: string; ring: string; badge: string }> = {
  indigo: {
    bg: 'bg-indigo-500',
    gradient: 'from-indigo-500 to-indigo-600',
    border: 'border-indigo-500',
    text: 'text-indigo-500',
    ring: 'ring-indigo-500/40',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
  },
  blue: {
    bg: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    border: 'border-blue-500',
    text: 'text-blue-500',
    ring: 'ring-blue-500/40',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-500',
    gradient: 'from-green-500 to-green-600',
    border: 'border-green-500',
    text: 'text-green-500',
    ring: 'ring-green-500/40',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  },
  emerald: {
    bg: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-emerald-600',
    border: 'border-emerald-500',
    text: 'text-emerald-500',
    ring: 'ring-emerald-500/40',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  },
  amber: {
    bg: 'bg-amber-500',
    gradient: 'from-amber-500 to-amber-600',
    border: 'border-amber-500',
    text: 'text-amber-500',
    ring: 'ring-amber-500/40',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  },
  orange: {
    bg: 'bg-orange-500',
    gradient: 'from-orange-500 to-orange-600',
    border: 'border-orange-500',
    text: 'text-orange-500',
    ring: 'ring-orange-500/40',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  },
  red: {
    bg: 'bg-red-500',
    gradient: 'from-red-500 to-red-600',
    border: 'border-red-500',
    text: 'text-red-500',
    ring: 'ring-red-500/40',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  },
  pink: {
    bg: 'bg-pink-500',
    gradient: 'from-pink-500 to-pink-600',
    border: 'border-pink-500',
    text: 'text-pink-500',
    ring: 'ring-pink-500/40',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400',
  },
};

/* ---------- Props ---------- */

interface ProfileCardProps {
  profile: Profile;
  ruleCount: number;
  isActive: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/* ---------- Component ---------- */

export function ProfileCard({
  profile,
  ruleCount,
  isActive,
  onActivate,
  onEdit,
  onDelete,
}: ProfileCardProps) {
  const colorConfig = PROFILE_COLORS[profile.color] ?? PROFILE_COLORS.indigo;
  const IconComponent = PROFILE_ICONS[profile.icon] ?? Folder;

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        group relative overflow-hidden rounded-xl
        bg-white dark:bg-gray-900
        border-2 transition-shadow duration-200
        ${
          isActive
            ? `${colorConfig.border} shadow-lg ring-4 ${colorConfig.ring}`
            : 'border-gray-200 dark:border-gray-800 hover:shadow-md'
        }
      `}
    >
      {/* Gradient header area */}
      <div className={`relative h-24 bg-gradient-to-br ${colorConfig.gradient} overflow-hidden`}>
        {/* Decorative circles */}
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

        {/* Icon */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white dark:bg-gray-900 shadow-lg border-2 border-white dark:border-gray-800">
            <IconComponent size={24} className={colorConfig.text} />
          </div>
        </div>

        {/* Hover action buttons (top-right) */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
            aria-label="Editar perfil"
          >
            <Pencil size={14} />
          </button>
          {!profile.is_default && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-red-500/80 text-white backdrop-blur-sm transition-colors"
              aria-label="Excluir perfil"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="pt-10 pb-4 px-4 text-center">
        {/* Profile name */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {profile.name}
        </h3>

        {/* Badges */}
        <div className="flex items-center justify-center gap-1.5 mt-2 min-h-[22px]">
          {isActive && (
            <Badge variant="success" size="sm">
              Ativo
            </Badge>
          )}
          {profile.is_default && (
            <Badge variant="info" size="sm">
              Padrão
            </Badge>
          )}
        </div>

        {/* Rule count */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {ruleCount === 0
            ? 'Nenhuma regra'
            : ruleCount === 1
              ? '1 regra associada'
              : `${ruleCount} regras associadas`}
        </p>

        {/* Activate button */}
        {!isActive && (
          <div className="mt-3">
            <Button
              variant="secondary"
              size="sm"
              icon={Zap}
              onClick={onActivate}
              className="w-full"
            >
              Ativar
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
