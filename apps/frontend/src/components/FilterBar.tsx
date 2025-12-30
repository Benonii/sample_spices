import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterBarProps {
  sortBy: string;
  orderBy: string;
  onSortChange: (sortBy: string) => void;
  onOrderChange: (orderBy: string) => void;
  className?: string;
}

export function FilterBar({
  sortBy,
  orderBy,
  onSortChange,
  onOrderChange,
  className = ""
}: FilterBarProps) {
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'createdAt', label: 'Date' },
  ];

  const orderOptions = [
    { value: 'ASC', label: 'Ascending' },
    { value: 'DESC', label: 'Descending' },
  ];

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 ${className}`}>
      <div className="flex items-center space-x-3 glass dark:glass-dark px-4 py-2.5 rounded-xl border border-orange-200/50 dark:border-orange-500/30">
        <span className="text-sm font-medium text-foreground/80 whitespace-nowrap">Sort by:</span>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px] border-orange-200/50 dark:border-orange-500/30 focus:ring-orange-500/20 hover:border-orange-400 dark:hover:border-orange-500/50 transition-all duration-300">
            <SelectValue placeholder="Select sort" />
          </SelectTrigger>
          <SelectContent className="glass dark:glass-dark border-orange-200/50 dark:border-orange-500/30">
            {sortOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="hover:bg-orange-50/50 dark:hover:bg-orange-950/30 focus:bg-orange-50 dark:focus:bg-orange-950/50 transition-colors"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-3 glass dark:glass-dark px-4 py-2.5 rounded-xl border border-orange-200/50 dark:border-orange-500/30">
        <span className="text-sm font-medium text-foreground/80 whitespace-nowrap">Order:</span>
        <Select value={orderBy} onValueChange={onOrderChange}>
          <SelectTrigger className="w-[140px] border-orange-200/50 dark:border-orange-500/30 focus:ring-orange-500/20 hover:border-orange-400 dark:hover:border-orange-500/50 transition-all duration-300">
            <SelectValue placeholder="Select order" />
          </SelectTrigger>
          <SelectContent className="glass dark:glass-dark border-orange-200/50 dark:border-orange-500/30">
            {orderOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="hover:bg-orange-50/50 dark:hover:bg-orange-950/30 focus:bg-orange-50 dark:focus:bg-orange-950/50 transition-colors"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
