import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  GraduationCap,
  HelpCircle,
  Book,
  Wrench,
  ChevronRight,
  Clock,
  FileText,
} from 'lucide-react';
import type { HelpCategory, HelpArticle } from '@/types/help';
import { useHelpStore, HELP_CATEGORIES } from '@/stores/helpStore';
import { HelpSearch } from './HelpSearch';
import { HelpFavorites } from './HelpFavorites';

const categoryIcons: Record<HelpCategory, React.ElementType> = {
  'getting-started': BookOpen,
  tutorials: GraduationCap,
  faq: HelpCircle,
  glossary: Book,
  troubleshooting: Wrench,
};

interface HelpSidebarProps {
  articlesByCategory: Record<HelpCategory, HelpArticle[]>;
  favoriteArticles: HelpArticle[];
  recentArticles: HelpArticle[];
}

export function HelpSidebar({
  articlesByCategory,
  favoriteArticles,
  recentArticles,
}: HelpSidebarProps) {
  const { selectedArticle, selectArticle } = useHelpStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['getting-started', 'tutorials']),
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <aside
      className="
        w-[250px] shrink-0 h-full
        bg-white dark:bg-gray-950
        border-r border-gray-200 dark:border-gray-800
        flex flex-col overflow-hidden
      "
    >
      {/* Search */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <HelpSearch />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {/* Favorites */}
        <HelpFavorites favoriteArticles={favoriteArticles} />

        {/* Categories */}
        {HELP_CATEGORIES.map((category) => {
          const Icon = categoryIcons[category.id];
          const isExpanded = expandedCategories.has(category.id);
          const articles = articlesByCategory[category.id] || [];

          return (
            <div key={category.id} className="mb-1">
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="
                  w-full flex items-center gap-2 px-3 py-2 rounded-lg
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-50 dark:hover:bg-gray-900
                  transition-colors duration-100
                "
              >
                <Icon size={16} className="shrink-0 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium flex-1 text-left">
                  {category.label}
                </span>
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ChevronRight size={14} className="text-gray-400 dark:text-gray-500" />
                </motion.div>
              </button>

              {/* Article List */}
              <AnimatePresence initial={false}>
                {isExpanded && articles.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="ml-3 pl-3 border-l border-gray-200 dark:border-gray-800">
                      {articles.map((article) => {
                        const isActive = selectedArticle?.slug === article.slug;
                        return (
                          <button
                            key={article.slug}
                            type="button"
                            onClick={() => selectArticle(article.slug)}
                            className={`
                              w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left
                              transition-colors duration-100
                              ${
                                isActive
                                  ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                              }
                            `}
                          >
                            <FileText size={13} className="shrink-0 opacity-60" />
                            <span className="text-xs font-medium truncate">
                              {article.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Recent Views */}
        {recentArticles.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 px-3 py-2">
              <Clock size={14} className="text-gray-400 dark:text-gray-500" />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Recentes
              </span>
            </div>
            {recentArticles.map((article) => {
              const isActive = selectedArticle?.slug === article.slug;
              return (
                <button
                  key={article.slug}
                  type="button"
                  onClick={() => selectArticle(article.slug)}
                  className={`
                    w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-left
                    transition-colors duration-100
                    ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
                  `}
                >
                  <FileText size={13} className="shrink-0 opacity-60" />
                  <span className="text-xs font-medium truncate">
                    {article.title}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
