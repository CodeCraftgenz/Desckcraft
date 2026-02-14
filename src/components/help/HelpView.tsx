import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Compass, Star } from 'lucide-react';
import type { HelpCategory } from '@/types/help';
import { useHelp } from '@/hooks/useHelp';
import { HelpSidebar } from './HelpSidebar';
import { ArticleViewer } from './ArticleViewer';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/stores';
import { useTourStore } from '@/stores/tourStore';
import { VIEWS } from '@/lib/constants';

export function HelpView() {
  const {
    selectedArticle,
    articlesByCategory,
    favoriteArticles,
    recentArticles,
    favorites,
    isLoading,
    selectArticle,
  } = useHelp();

  const setView = useAppStore((s) => s.setView);
  const startTour = useTourStore((s) => s.startTour);

  // When clicking a category card on welcome screen, select the first article in that category
  const handleSelectFirstInCategory = useCallback(
    (category: HelpCategory) => {
      const articles = articlesByCategory[category];
      if (articles && articles.length > 0) {
        selectArticle(articles[0].slug);
      }
    },
    [articlesByCategory, selectArticle],
  );

  const handleStartTour = useCallback(() => {
    startTour();
    setView(VIEWS.DASHBOARD);
  }, [startTour, setView]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="
        flex flex-col h-[calc(100vh-3.5rem)]
        bg-gray-50 dark:bg-gray-950
        rounded-xl overflow-hidden
        border border-gray-200 dark:border-gray-800
      "
    >
      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <HelpSidebar
          articlesByCategory={articlesByCategory}
          favoriteArticles={favoriteArticles}
          recentArticles={recentArticles}
        />

        {/* Article Viewer */}
        <main className="flex-1 min-w-0 bg-white dark:bg-gray-900 overflow-hidden">
          <ArticleViewer
            article={selectedArticle}
            onSelectFirstInCategory={handleSelectFirstInCategory}
          />
        </main>
      </div>

      {/* Bottom Bar */}
      <div
        className="
          flex items-center justify-between
          px-4 py-2.5
          bg-white dark:bg-gray-900
          border-t border-gray-200 dark:border-gray-800
          shrink-0
        "
      >
        <Button
          variant="ghost"
          size="sm"
          icon={Compass}
          onClick={handleStartTour}
        >
          Fazer Tour
        </Button>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Star size={12} className="text-amber-500" />
          <span>
            {favorites.length}{' '}
            {favorites.length === 1 ? 'favorito' : 'favoritos'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
