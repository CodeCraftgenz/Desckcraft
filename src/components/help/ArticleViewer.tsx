import { useMemo } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Star,
  ChevronRight,
  BookOpen,
  GraduationCap,
  HelpCircle,
  Book,
  Wrench,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import type { HelpArticle, HelpCategory } from '@/types/help';
import { useHelpStore, HELP_CATEGORIES } from '@/stores/helpStore';

const categoryIcons: Record<HelpCategory, React.ElementType> = {
  'getting-started': BookOpen,
  tutorials: GraduationCap,
  faq: HelpCircle,
  glossary: Book,
  troubleshooting: Wrench,
};

interface WelcomeCardProps {
  onSelectCategory: (category: HelpCategory) => void;
}

function WelcomeCard({ onSelectCategory }: WelcomeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center h-full py-16 px-8"
    >
      <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center mb-6">
        <HelpCircle size={32} className="text-brand-600 dark:text-brand-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Central de Ajuda
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
        Encontre tutoriais, dicas e respostas para suas duvidas sobre o DeskCraft.
        Selecione um artigo na barra lateral ou explore as categorias abaixo.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
        {HELP_CATEGORIES.map((category) => {
          const Icon = categoryIcons[category.id];
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className="
                flex items-center gap-3 p-4 rounded-xl
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                hover:border-brand-300 dark:hover:border-brand-700
                hover:shadow-sm
                transition-all duration-150
                text-left group
              "
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/30 transition-colors">
                <Icon size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {category.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

interface ArticleViewerProps {
  article: HelpArticle | null;
  onSelectFirstInCategory: (category: HelpCategory) => void;
}

export function ArticleViewer({ article, onSelectFirstInCategory }: ArticleViewerProps) {
  const { favorites, toggleFavorite } = useHelpStore();

  const isFav = article ? favorites.includes(article.slug) : false;

  const categoryLabel = useMemo(() => {
    if (!article) return '';
    const cat = HELP_CATEGORIES.find((c) => c.id === article.category);
    return cat?.label ?? article.category;
  }, [article]);

  if (!article) {
    return <WelcomeCard onSelectCategory={onSelectFirstInCategory} />;
  }

  return (
    <motion.div
      key={article.slug}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="h-full overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-6">
          <span>Ajuda</span>
          <ChevronRight size={12} className="opacity-50" />
          <span>{categoryLabel}</span>
          <ChevronRight size={12} className="opacity-50" />
          <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
            {article.title}
          </span>
        </nav>

        {/* Header with Favorite */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {article.title}
          </h1>
          <button
            type="button"
            onClick={() => toggleFavorite(article.slug)}
            className={`
              shrink-0 p-2 rounded-lg transition-colors duration-150
              ${
                isFav
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                  : 'text-gray-400 dark:text-gray-500 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
            title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Star size={20} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Markdown Content */}
        <div className="prose-help">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-3">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-outside ml-5 mb-4 space-y-1.5">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-outside ml-5 mb-4 space-y-1.5">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {children}
                </li>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-brand-300 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-950/20 px-4 py-3 mb-4 rounded-r-lg">
                  {children}
                </blockquote>
              ),
              code: ({ className, children }) => {
                const isBlock = className?.includes('language-');
                if (isBlock) {
                  return (
                    <code
                      className={`
                        block bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4
                        text-sm font-mono text-gray-800 dark:text-gray-200
                        overflow-x-auto ${className || ''}
                      `}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <code className="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="mb-4 overflow-x-auto">{children}</pre>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900 dark:text-gray-100">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-600 dark:text-gray-400">
                  {children}
                </em>
              ),
              hr: () => (
                <hr className="my-8 border-gray-200 dark:border-gray-800" />
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Was this helpful? */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Este artigo foi útil?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  text-sm text-gray-600 dark:text-gray-400
                  bg-gray-100 dark:bg-gray-800
                  hover:bg-emerald-50 hover:text-emerald-600
                  dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400
                  transition-colors duration-150
                "
              >
                <ThumbsUp size={14} />
                <span>Sim</span>
              </button>
              <button
                type="button"
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  text-sm text-gray-600 dark:text-gray-400
                  bg-gray-100 dark:bg-gray-800
                  hover:bg-red-50 hover:text-red-600
                  dark:hover:bg-red-900/20 dark:hover:text-red-400
                  transition-colors duration-150
                "
              >
                <ThumbsDown size={14} />
                <span>Não</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
