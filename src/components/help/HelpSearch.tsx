import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText } from 'lucide-react';
import { useHelpStore, HELP_CATEGORIES } from '@/stores/helpStore';
import { Badge } from '@/components/ui/Badge';

export function HelpSearch() {
  const { searchQuery, searchResults, searchArticles, selectArticle, clearSearch } =
    useHelpStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  const handleChange = useCallback(
    (value: string) => {
      setLocalQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        searchArticles(value);
        setIsOpen(value.trim().length > 0);
      }, 300);
    },
    [searchArticles],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleClear = () => {
    setLocalQuery('');
    clearSearch();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSelectResult = (slug: string) => {
    selectArticle(slug);
    setLocalQuery('');
    setIsOpen(false);
  };

  const getCategoryLabel = (categoryId: string) => {
    const cat = HELP_CATEGORIES.find((c) => c.id === categoryId);
    return cat?.label ?? categoryId;
  };

  const getCategoryBadgeVariant = (categoryId: string) => {
    switch (categoryId) {
      case 'getting-started':
        return 'info' as const;
      case 'tutorials':
        return 'success' as const;
      case 'faq':
        return 'warning' as const;
      case 'glossary':
        return 'default' as const;
      case 'troubleshooting':
        return 'danger' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={16} className="text-gray-400 dark:text-gray-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (localQuery.trim().length > 0) setIsOpen(true);
          }}
          placeholder="Buscar na ajuda..."
          className="
            w-full pl-9 pr-8 py-2 text-sm
            bg-gray-50 dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            rounded-lg
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500
            transition-colors duration-150
          "
        />
        {localQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="
              absolute z-50 top-full left-0 right-0 mt-1
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-700
              rounded-lg shadow-lg
              max-h-80 overflow-y-auto
            "
          >
            {searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Search size={24} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhum resultado para "{localQuery}"
                </p>
              </div>
            ) : (
              <ul className="py-1">
                {searchResults.map((result) => (
                  <li key={result.slug}>
                    <button
                      type="button"
                      onClick={() => handleSelectResult(result.slug)}
                      className="
                        w-full text-left px-4 py-3
                        hover:bg-gray-50 dark:hover:bg-gray-800
                        transition-colors duration-100
                        border-b border-gray-100 dark:border-gray-800 last:border-0
                      "
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileText size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {result.title}
                        </span>
                        <Badge
                          variant={getCategoryBadgeVariant(result.category)}
                          size="sm"
                        >
                          {getCategoryLabel(result.category)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 ml-[22px]">
                        {result.excerpt}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
