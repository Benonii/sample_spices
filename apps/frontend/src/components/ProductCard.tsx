import { Link, useNavigate } from '@tanstack/react-router';
import { Star, ShoppingCart, ExternalLink, Trash2 } from 'lucide-react';
import type { Product, Review } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { authClient } from '@/lib/authClient';
import { getReviews, getCheckoutSession } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

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
  const isInCart = !!cartItem;

  const handleCartAction = async () => {
    if (isInCart) {
      // Remove from cart
      try {
        await removeItemFromCart(cartItem.id);
        if (onCartAction) {
          onCartAction(product, 'remove');
        }
      } catch (error) {
        console.error('Failed to remove from cart:', error);
      }
    } else {
      // Add to cart
      if (onAddToCart) {
        onAddToCart(product);
      }
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      // TODO: Show login modal or redirect to login
      console.log('User not logged in');
      return;
    }

    if (product.inventory === 0) {
      console.log('Product out of stock');
      return;
    }

    try {
      const checkoutData = await getCheckoutSession([
        {
          productID: product.id,
          quantity: 1
        }
      ]);
      
      // Redirect to Stripe checkout page
      if (checkoutData.data?.url) {
        window.location.href = checkoutData.data.url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      // TODO: Show error toast
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
    <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-t-lg mt-[-24px]">
        {/* Overlay with external link icon - positioned first so it's on top */}
        <button
          onClick={handleImageClick}
          className="absolute inset-0 bg-green-600/0 group-hover:bg-green-600/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer z-10"
          aria-label={`View details for ${product.name}`}
        >
          <ExternalLink className="w-8 h-8 text-white drop-shadow-lg" />
        </button>
        
        {/* Image or placeholder */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
          />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center pointer-events-none">
            <span className="text-muted-foreground text-sm">Spice Image</span>
          </div>
        )}
      </div>
      
      <CardContent className="flex-1 px-4">
        <Link
          to="/product/$productId"
          params={{ productId: product.id }}
          className="block"
        >
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
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
                      {/* Half star (left side) */}
                      <div className="absolute left-0 top-0 w-2 h-4 overflow-hidden">
                        <Star
                          className="w-4 h-4 text-amber-600 fill-current"
                          style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
                        />
                      </div>
                      {/* Empty star (right side) */}
                      <Star className="w-4 h-4 text-muted-foreground" />
                    </>
                  ) : (
                    <Star
                      className={`w-4 h-4 ${
                        isFullStar
                          ? 'text-amber-600 fill-current'
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
          
          <span className="text-lg font-bold text-foreground">
            ${product.price.toFixed(2)}
          </span>
        </div>
        
        {product.inventory !== undefined && (
          <div className="text-sm text-muted-foreground mb-3">
            {product.inventory > 0 ? (
              <span className="text-green-600">
                In Stock ({product.inventory} available)
              </span>
            ) : (
              <span className="text-destructive">Out of Stock</span>
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
            className={`flex-1 ${isInCart ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300' : ''}`}
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
                    Add to Cart
                  </>
                )}
              </>
            )}
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={product.inventory === 0 || loading}
            className="flex-1"
          >
            Buy Now
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
