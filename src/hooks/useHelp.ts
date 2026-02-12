import { useEffect, useCallback, useMemo } from 'react';
import { useHelpStore, HELP_CATEGORIES } from '@/stores/helpStore';
import type { HelpArticle, HelpCategory } from '@/types/help';

/**
 * Custom hook that wraps the helpStore for use in components.
 * Handles initialization (loading articles, favorites, recent views)
 * and provides convenient accessors and actions.
 */
export function useHelp() {
  const {
    articles,
    favorites,
    recentViews,
    searchQuery,
    searchResults,
    selectedArticle,
    isLoading,
    error,
    loadArticles,
    searchArticles,
    selectArticle,
    toggleFavorite,
    fetchFavorites,
    fetchRecentViews,
    clearSearch,
    isFavorite,
    getArticlesByCategory,
  } = useHelpStore();

  // Initialize on mount
  useEffect(() => {
    if (articles.length === 0) {
      loadArticles();
    }
    fetchFavorites();
    fetchRecentViews();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Get articles grouped by category
  const articlesByCategory = useMemo(() => {
    const grouped: Record<HelpCategory, HelpArticle[]> = {
      'getting-started': [],
      tutorials: [],
      faq: [],
      glossary: [],
      troubleshooting: [],
    };
    for (const article of articles) {
      if (grouped[article.category]) {
        grouped[article.category].push(article);
      }
    }
    return grouped;
  }, [articles]);

  // Favorited articles as full objects
  const favoriteArticles = useMemo(() => {
    return articles.filter((a) => favorites.includes(a.slug));
  }, [articles, favorites]);

  // Recent view articles as full objects (ordered by most recent)
  const recentArticles = useMemo(() => {
    return recentViews
      .map((v) => articles.find((a) => a.slug === v.article_slug))
      .filter((a): a is HelpArticle => a !== undefined);
  }, [articles, recentViews]);

  // Get category label
  const getCategoryLabel = useCallback((category: HelpCategory): string => {
    const found = HELP_CATEGORIES.find((c) => c.id === category);
    return found?.label ?? category;
  }, []);

  return {
    // State
    articles,
    favorites,
    recentViews,
    searchQuery,
    searchResults,
    selectedArticle,
    isLoading,
    error,

    // Computed
    articlesByCategory,
    favoriteArticles,
    recentArticles,
    categories: HELP_CATEGORIES,

    // Actions
    loadArticles,
    searchArticles,
    selectArticle,
    toggleFavorite,
    fetchFavorites,
    fetchRecentViews,
    clearSearch,
    isFavorite,
    getArticlesByCategory,
    getCategoryLabel,
  };
}
