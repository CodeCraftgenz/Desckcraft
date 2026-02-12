import { motion, AnimatePresence } from 'framer-motion';
import { Star, FileText } from 'lucide-react';
import { useHelpStore } from '@/stores/helpStore';

interface HelpFavoritesProps {
  favoriteArticles: { slug: string; title: string }[];
}

export function HelpFavorites({ favoriteArticles }: HelpFavoritesProps) {
  const { selectArticle, toggleFavorite, selectedArticle } = useHelpStore();

  if (favoriteArticles.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 px-3 py-2">
        <Star size={14} className="text-amber-500" />
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Favoritos
        </span>
      </div>
      <AnimatePresence mode="popLayout">
        {favoriteArticles.map((article) => {
          const isActive = selectedArticle?.slug === article.slug;
          return (
            <motion.button
              key={article.slug}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              type="button"
              onClick={() => selectArticle(article.slug)}
              className={`
                w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-md
                transition-colors duration-100 group
                ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }
              `}
            >
              <FileText size={13} className="shrink-0 opacity-60" />
              <span className="text-xs font-medium truncate flex-1">
                {article.title}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(article.slug);
                }}
                className="
                  opacity-0 group-hover:opacity-100
                  text-gray-400 hover:text-amber-500
                  transition-opacity duration-100
                  shrink-0
                "
                title="Remover dos favoritos"
              >
                <Star size={12} fill="currentColor" />
              </button>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
