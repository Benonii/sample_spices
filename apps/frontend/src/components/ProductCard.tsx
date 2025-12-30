import { Link, useNavigate } from '@tanstack/react-router';
import { Star, ShoppingCart, ExternalLink, Trash2 } from 'lucide-react';
import type { Product, Review } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { authClient } from '@/lib/authClient';
import { getReviews, getCheckoutSession, getAddresses } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onCartAction?: (product: Product, action: 'add' | 'remove') => void;
  loading?: boolean;
}

export function ProductCard({ product, onAddToCart, onCartAction, loading = false }: ProductCardProps) {
  const navigate = useNavigate();
  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;
  const { cartItems, removeItemFromCart } = useCart(user?.id || null);

  // Check if this product is already in the cart
  const cartItem = cartItems.find(item => item.productID === product.id);
  const actualIsInCart = !!cartItem;

  // Optimistic state for immediate UI feedback
  const [optimisticIsInCart, setOptimisticIsInCart] = useState(actualIsInCart);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);

  // Sync optimistic state with actual cart state
  useEffect(() => {
    setOptimisticIsInCart(actualIsInCart);
  }, [actualIsInCart]);

  // Use optimistic state for UI
  const isInCart = optimisticIsInCart;

  const handleCartAction = async () => {
    if (isInCart) {
      // Optimistically update UI immediately
      setOptimisticIsInCart(false);

      // Remove from cart
      try {
        await removeItemFromCart(cartItem!.id);
        if (onCartAction) {
          onCartAction(product, 'remove');
        }
      } catch (error) {
        console.error('Failed to remove from cart:', error);
        // Revert optimistic update on error
        setOptimisticIsInCart(true);
      }
    } else {
      // Optimistically update UI immediately
      setOptimisticIsInCart(true);

      // Add to cart
      if (onAddToCart) {
        try {
          await onAddToCart(product);
        } catch (error) {
          console.error('Failed to add to cart:', error);
          // Revert optimistic update on error
          setOptimisticIsInCart(false);
        }
      }
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please login to purchase');
      navigate({ to: '/login' });
      return;
    }

    if (product.inventory === 0) {
      toast.error('Product is out of stock');
      return;
    }

    setIsBuyNowLoading(true);

    try {
      // Fetch user addresses to find a default one
      const addressResponse = await getAddresses(user.id);
      const addresses = addressResponse.data;

      if (!addresses || addresses.length === 0) {
        toast.error('Please add a shipping address first');
        return;
      }

      // Find default address or use the first one
      const defaultAddress = addresses.find((addr: any) => addr.isDefault) || addresses[0];

      if (!defaultAddress) {
        toast.error('No valid address found');
        return;
      }

      const checkoutData = await getCheckoutSession(
        [
          {
            productID: product.id,
            quantity: 1
          }
        ],
        defaultAddress.id,
        user.id
      );

      // Redirect to Stripe checkout page
      if (checkoutData.data?.url) {
        window.location.href = checkoutData.data.url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      toast.error('Failed to initiate checkout');
    } finally {
      setIsBuyNowLoading(false);
    }
  };


  const handleImageClick = () => {
    navigate({
      to: '/product/$productId',
      params: { productId: product.id }
    });
  };

  const { data: reviews } = useQuery({
    queryKey: ['reviews', product.id],
    queryFn: () => getReviews({ productID: product.id, _start: 0, _end: 10 }),
    enabled: !!product.id,
  });

  const averageRating = reviews?.data.list && reviews.data.list.length > 0
    ? reviews.data.list.reduce((acc: number, review: Review) => {
      const rating = typeof review.rating === 'string' ? parseFloat(review.rating) : review.rating;
      return acc + (rating || 0);
    }, 0) / reviews.data.list.length
    : product.rating || 0;

  // Ensure averageRating is a valid number
  const validAverageRating = isNaN(averageRating) ? 0 : averageRating;

  return (
    <Card className="group h-full flex flex-col glass-card dark:glass-card-dark transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-orange-200/50 dark:border-orange-500/20">
      <div className="relative overflow-hidden rounded-t-2xl mt-[-24px]">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/0 to-red-600/0 group-hover:from-orange-600/40 group-hover:to-red-600/40 transition-all duration-500 z-10" />

        {/* Overlay with external link icon */}
        <button
          onClick={handleImageClick}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer z-20 transition-opacity duration-300"
          aria-label={`View details for ${product.name}`}
        >
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-full shadow-xl transform group-hover:scale-110 transition-transform duration-300">
            <ExternalLink className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
        </button>

        {/* Image or placeholder */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
          />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center pointer-events-none">
            <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">Spice Image</span>
          </div>
        )}
      </div>

      <CardContent className="flex-1 px-4 py-4">
        <Link
          to="/product/$productId"
          params={{ productId: product.id }}
          className="block group/link"
        >
          <h3 className="font-semibold text-lg text-foreground group-hover/link:bg-gradient-to-r group-hover/link:from-orange-600 group-hover/link:to-red-600 group-hover/link:bg-clip-text group-hover/link:text-transparent transition-all duration-300 line-clamp-2 mb-2">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {product.description}
          </p>
        </Link>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => {
              const starValue = i + 1;
              const isHalfStar = validAverageRating % 1 !== 0 && Math.ceil(validAverageRating) === starValue;
              const isFullStar = validAverageRating >= starValue;

              return (
                <div key={i} className="relative">
                  {isHalfStar ? (
                    <>
                      <div className="absolute left-0 top-0 w-2 h-4 overflow-hidden">
                        <Star
                          className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-current"
                          style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
                        />
                      </div>
                      <Star className="w-4 h-4 text-muted-foreground" />
                    </>
                  ) : (
                    <Star
                      className={`w-4 h-4 transition-colors ${isFullStar
                        ? 'text-amber-500 dark:text-amber-400 fill-current'
                        : 'text-muted-foreground'
                        }`}
                    />
                  )}
                </div>
              );
            })}
            <span className="text-sm text-muted-foreground ml-1">
              ({validAverageRating.toFixed(1)})
            </span>
          </div>

          <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            ${product.price.toFixed(2)}
          </span>
        </div>

        {product.inventory !== undefined && (
          <div className="text-sm mb-3">
            {product.inventory > 0 ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 text-xs font-medium border border-orange-200 dark:border-orange-500/20">
                In Stock ({product.inventory})
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs font-medium border border-red-200 dark:border-red-500/20">
                Out of Stock
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex space-x-2 w-full">
          <Button
            onClick={handleCartAction}
            disabled={product.inventory === 0 || loading}
            variant={isInCart ? "secondary" : "outline"}
            className={`flex-1 transition-all duration-300 ${isInCart
              ? 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-950/30 dark:to-rose-950/30 text-red-700 dark:text-red-400 hover:from-red-200 hover:to-rose-200 dark:hover:from-red-900/40 dark:hover:to-rose-900/40 border-red-300 dark:border-red-500/30'
              : 'border-orange-300/50 dark:border-orange-500/30 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 hover:border-orange-400 dark:hover:border-orange-500/50 hover:scale-105'
              }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {isInCart ? 'Removing...' : 'Adding...'}
              </>
            ) : (
              <>
                {isInCart ? (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add
                  </>
                )}
              </>
            )}
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={product.inventory === 0 || loading || isBuyNowLoading}
            className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            {isBuyNowLoading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </>
            ) : (
              'Buy Now'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

