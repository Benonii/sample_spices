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
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-foreground whitespace-nowrap">Sort by:</span>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select sort" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-foreground whitespace-nowrap">Order:</span>
        <Select value={orderBy} onValueChange={onOrderChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select order" />
          </SelectTrigger>
          <SelectContent>
            {orderOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
