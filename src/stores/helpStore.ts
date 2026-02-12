import { create } from 'zustand';
import type {
  HelpArticle,
  HelpArticleMeta,
  HelpCategory,
  HelpView,
  HelpSearchResult,
} from '@/types/help';

// --- Bundled content imports ---
import articleIndex from '@/content/help/index.json';
import gettingStartedMd from '@/content/help/getting-started.md?raw';
import tutorialRulesMd from '@/content/help/tutorial-rules.md?raw';
import tutorialSimulationMd from '@/content/help/tutorial-simulation.md?raw';
import tutorialProfilesMd from '@/content/help/tutorial-profiles.md?raw';
import tutorialWatcherMd from '@/content/help/tutorial-watcher.md?raw';
import tutorialRollbackMd from '@/content/help/tutorial-rollback.md?raw';
import faqMd from '@/content/help/faq.md?raw';
import glossaryMd from '@/content/help/glossary.md?raw';
import troubleshootingMd from '@/content/help/troubleshooting.md?raw';

/** Map slug → raw markdown content */
const contentMap: Record<string, string> = {
  'getting-started': gettingStartedMd,
  'tutorial-rules': tutorialRulesMd,
  'tutorial-simulation': tutorialSimulationMd,
  'tutorial-profiles': tutorialProfilesMd,
  'tutorial-watcher': tutorialWatcherMd,
  'tutorial-rollback': tutorialRollbackMd,
  faq: faqMd,
  glossary: glossaryMd,
  troubleshooting: troubleshootingMd,
};

/** Category display metadata */
export const HELP_CATEGORIES: {
  id: HelpCategory;
  label: string;
}[] = [
  { id: 'getting-started', label: 'Primeiros Passos' },
  { id: 'tutorials', label: 'Tutoriais' },
  { id: 'faq', label: 'FAQ' },
  { id: 'glossary', label: 'Glossário' },
  { id: 'troubleshooting', label: 'Solução de Problemas' },
];

/** LocalStorage keys */
const FAVORITES_KEY = 'deskcraft_help_favorites';
const RECENT_VIEWS_KEY = 'deskcraft_help_recent_views';
const MAX_RECENT_VIEWS = 5;

function loadFavoritesFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {
    // ignore
  }
  return [];
}

function saveFavoritesToStorage(favorites: string[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // ignore
  }
}

function loadRecentViewsFromStorage(): HelpView[] {
  try {
    const raw = localStorage.getItem(RECENT_VIEWS_KEY);
    if (raw) return JSON.parse(raw) as HelpView[];
  } catch {
    // ignore
  }
  return [];
}

function saveRecentViewsToStorage(views: HelpView[]) {
  try {
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(views));
  } catch {
    // ignore
  }
}

/**
 * Perform a local fuzzy search over help articles.
 * Scores articles based on title, tags, and content matches.
 */
function localSearch(
  articles: HelpArticle[],
  query: string,
): HelpSearchResult[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  const terms = lowerQuery.split(/\s+/);

  const scored = articles
    .map((article) => {
      let score = 0;
      const lowerTitle = article.title.toLowerCase();
      const lowerContent = article.content.toLowerCase();
      const lowerTags = article.tags.map((t) => t.toLowerCase());

      for (const term of terms) {
        // Title match (highest weight)
        if (lowerTitle.includes(term)) {
          score += lowerTitle === term ? 100 : 50;
        }
        // Tag match (medium weight)
        if (lowerTags.some((tag) => tag.includes(term))) {
          score += 30;
        }
        // Content match (lower weight)
        if (lowerContent.includes(term)) {
          score += 10;
        }
      }

      // Extract an excerpt around the first match in content
      let excerpt = '';
      const contentIdx = lowerContent.indexOf(terms[0]);
      if (contentIdx !== -1) {
        const start = Math.max(0, contentIdx - 40);
        const end = Math.min(article.content.length, contentIdx + 120);
        excerpt =
          (start > 0 ? '...' : '') +
          article.content.slice(start, end).trim() +
          (end < article.content.length ? '...' : '');
      } else {
        excerpt = article.content.slice(0, 150).trim() + '...';
      }

      return {
        slug: article.slug,
        title: article.title,
        category: article.category,
        excerpt,
        score,
      } satisfies HelpSearchResult;
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored;
}

interface HelpState {
  articles: HelpArticle[];
  favorites: string[];
  recentViews: HelpView[];
  searchQuery: string;
  searchResults: HelpSearchResult[];
  selectedArticle: HelpArticle | null;
  isLoading: boolean;
  error: string | null;

  loadArticles: () => void;
  searchArticles: (query: string) => void;
  selectArticle: (slug: string) => void;
  toggleFavorite: (slug: string) => void;
  fetchFavorites: () => void;
  fetchRecentViews: () => void;
  clearSearch: () => void;
  isFavorite: (slug: string) => boolean;
  getArticlesByCategory: (category: HelpCategory) => HelpArticle[];
}

export const useHelpStore = create<HelpState>()((set, get) => ({
  articles: [],
  favorites: [],
  recentViews: [],
  searchQuery: '',
  searchResults: [],
  selectedArticle: null,
  isLoading: false,
  error: null,

  loadArticles: () => {
    set({ isLoading: true, error: null });
    try {
      const meta = articleIndex as HelpArticleMeta[];
      const articles: HelpArticle[] = meta.map((entry) => ({
        slug: entry.slug,
        title: entry.title,
        category: entry.category,
        tags: entry.tags,
        excerpt: entry.excerpt,
        order: entry.order,
        content: contentMap[entry.slug] || '',
      }));
      articles.sort((a, b) => a.order - b.order);
      set({ articles, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },

  searchArticles: (query) => {
    const { articles } = get();
    const searchResults = localSearch(articles, query);
    set({ searchQuery: query, searchResults });
  },

  selectArticle: (slug) => {
    const { articles, recentViews } = get();
    const article = articles.find((a) => a.slug === slug) ?? null;
    set({ selectedArticle: article, searchQuery: '', searchResults: [] });

    if (article) {
      // Record view locally
      const now = new Date().toISOString();
      const newView: HelpView = {
        id: `${slug}-${Date.now()}`,
        article_slug: slug,
        viewed_at: now,
      };
      // Remove existing view for same slug, add new at front, keep max
      const filtered = recentViews.filter((v) => v.article_slug !== slug);
      const updated = [newView, ...filtered].slice(0, MAX_RECENT_VIEWS);
      set({ recentViews: updated });
      saveRecentViewsToStorage(updated);
    }
  },

  toggleFavorite: (slug) => {
    const { favorites } = get();
    const isFav = favorites.includes(slug);
    let updated: string[];
    if (isFav) {
      updated = favorites.filter((s) => s !== slug);
    } else {
      updated = [...favorites, slug];
    }
    set({ favorites: updated });
    saveFavoritesToStorage(updated);
  },

  fetchFavorites: () => {
    const favorites = loadFavoritesFromStorage();
    set({ favorites });
  },

  fetchRecentViews: () => {
    const recentViews = loadRecentViewsFromStorage();
    set({ recentViews });
  },

  clearSearch: () => set({ searchQuery: '', searchResults: [] }),

  isFavorite: (slug) => {
    return get().favorites.includes(slug);
  },

  getArticlesByCategory: (category) => {
    return get().articles.filter((a) => a.category === category);
  },
}));
