export interface HelpArticleMeta {
  slug: string;
  title: string;
  category: HelpCategory;
  tags: string[];
  excerpt: string;
  order: number;
}

export interface HelpArticle {
  slug: string;
  title: string;
  category: HelpCategory;
  tags: string[];
  content: string;
  excerpt: string;
  order: number;
}

export type HelpCategory =
  | 'getting-started'
  | 'tutorials'
  | 'faq'
  | 'glossary'
  | 'troubleshooting';

export interface HelpFavorite {
  id: string;
  article_slug: string;
  created_at: string;
}

export interface HelpView {
  id: string;
  article_slug: string;
  viewed_at: string;
}

export interface HelpSearchResult {
  slug: string;
  title: string;
  category: HelpCategory;
  excerpt: string;
  score: number;
}
