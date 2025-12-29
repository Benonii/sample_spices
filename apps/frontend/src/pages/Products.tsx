import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/lib/api';
import { ProductCard, SearchBar, FilterBar, Pagination } from '@/components';
import type { ProductQueryParams } from '@/lib/types';
import { Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { authClient } from '@/lib/authClient';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 12;

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'createdAt'>('createdAt');
  const [orderBy, setOrderBy] = useState<'ASC' | 'DESC'>('DESC');
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;
  const { addItemToCart } = useCart(user?.id || null);

  const queryParams: ProductQueryParams = {
    _start: (currentPage - 1) * ITEMS_PER_PAGE,
    _end: currentPage * ITEMS_PER_PAGE,
    sortBy,
    orderBy,
    q: searchQuery || undefined,
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => getProducts(queryParams),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy as 'name' | 'price' | 'createdAt');
    setCurrentPage(1);
  };

  const handleOrderChange = (newOrderBy: string) => {
    setOrderBy(newOrderBy as 'ASC' | 'DESC');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (product: any) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    setLoadingProductId(product.id);
    
    try {
      await addItemToCart(product.id, 1);
      toast.success(`${product.name} added to cart successfully`);
    } catch (error) {
      toast.error('Failed to add item to cart');
      console.error('Failed to add to cart:', error);
    } finally {
      setLoadingProductId(null);
    }
  };

  const handleCartAction = async (product: any, action: 'add' | 'remove') => {
    if (!user) {
      toast.error('Please login to manage your cart');
      return;
    }

    setLoadingProductId(product.id);
    
    try {
      if (action === 'add') {
        await addItemToCart(product.id, 1);
        toast.success(`${product.name} added to cart successfully`);
      } else {
        // Remove from cart logic will be handled by the ProductCard component
        // This is just for the loading state
      }
    } catch (error) {
      toast.error(`Failed to ${action} item from cart`);
      console.error(`Failed to ${action} from cart:`, error);
    } finally {
      setLoadingProductId(null);
    }
  };

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="mx-auto w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] px-3 sm:px-4 md:px-6 lg:px-4">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-lg font-medium text-foreground">
              Error loading spices
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Something went wrong'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-10">
      {/* Header */}
      <div className="bg-card">
        <div className="mx-auto w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] px-3 sm:px-4 md:px-6 lg:px-4 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Our Spices
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Discover authentic Ethiopian spices and traditional blends
          </p>
        </div>
      </div>

      <div className="mx-auto w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] px-3 sm:px-4 md:px-6 lg:px-4 py-6 sm:py-8">
        {/* Search and Filters */}
        <div className="mb-8 sm:mb-10 space-y-6">
          <div className="flex gap-6">
            <div className="w-full">
              <SearchBar onSearch={handleSearch} className="w-full max-w-2xl" />
            </div>
            <div className="flex justify-between">
              <FilterBar
                sortBy={sortBy}
                orderBy={orderBy}
                onSortChange={handleSortChange}
                onOrderChange={handleOrderChange}
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
            <span className="ml-2 text-muted-foreground">Loading spices...</span>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && data && (
          <>
            {/* Results Count */}
            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing {data.list.length} of {data.total} spices
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {data.list.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onCartAction={handleCartAction}
                  loading={loadingProductId === product.id}
                />
              ))}
            </div>

            {/* Empty State */}
            {data.list.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-foreground">No spices found</h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria to find the perfect spice.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-6 sm:mt-8"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
