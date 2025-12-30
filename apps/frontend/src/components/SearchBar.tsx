import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ onSearch, placeholder = "Search products...", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState('');

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-600 dark:text-orange-400 transition-transform duration-300 group-focus-within:scale-110" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-12 pr-12 py-4 h-14 text-base w-full glass dark:glass-dark border-2 border-orange-200/50 dark:border-orange-500/30 rounded-2xl focus:ring-0 focus:border-orange-500 dark:focus:border-orange-400 focus:shadow-lg focus:shadow-orange-500/20 dark:focus:shadow-orange-400/20 transition-all duration-300 placeholder:text-muted-foreground"
        />
        {query && (
          <Button
            type="button"
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-orange-100/50 dark:hover:bg-orange-900/30 rounded-xl transition-all duration-300 hover:scale-110"
          >
            <X className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </Button>
        )}
      </div>
    </div>
  );
}
