import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getProduct, getReviews, getCheckoutSession } from '@/lib/api';
import { Button, ReviewForm, ReviewList } from '@/components';
import type { Review } from '@/lib/types';
import { 
  Star, 
  ShoppingCart, 
  Loader2,
  AlertCircle,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useCart } from '@/hooks/useCart';
import { authClient } from '@/lib/authClient';
import { toast } from 'sonner';
import { useState } from 'react';

export default function ProductDetail() {
  const { productId } = useParams({ from: '/product/$productId' });
  const [loading, setLoading] = useState(false);
  
  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;
  const { cartItems, addItemToCart, removeItemFromCart } = useCart(user?.id || null);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
    enabled: !!productId,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => getReviews({ productID: productId, _start: 0, _end: 10 }),
    enabled: !!productId,
  });

  // Debug logging
  console.log('ProductDetail Debug:', {
    productId,
    productRating: product?.rating,
    reviewsCount: reviews?.data.list?.length || 0,
    reviews: reviews?.data.list,
    firstReview: reviews?.data.list?.[0]
  });

  // Check if this product is already in the cart
  const cartItem = cartItems.find(item => item.productID === productId);
  const isInCart = !!cartItem;

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!product) return;

    setLoading(true);
    try {
      await addItemToCart(product.id, 1);
      toast.success(`${product.name} added to cart successfully`);
    } catch (error) {
      toast.error('Failed to add item to cart');
      console.error('Failed to add to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async () => {
    if (!cartItem) return;

    setLoading(true);
    try {
      await removeItemFromCart(cartItem.id);
      toast.success(`${product?.name} removed from cart successfully`);
    } catch (error) {
      toast.error('Failed to remove item from cart');
      console.error('Failed to remove from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCartAction = () => {
    if (isInCart) {
      handleRemoveFromCart();
    } else {
      handleAddToCart();
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please login to proceed with checkout');
      return;
    }

    if (!product) return;

    if (!isInStock) {
      toast.error('Product is out of stock');
      return;
    }

    setLoading(true);
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
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      toast.error('Failed to create checkout session');
      console.error('Failed to create checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get user's existing review
  const userReview = reviews?.data.list?.find((review: Review) => review.userID === user?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-lg font-medium text-foreground">
              Spice not found
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Something went wrong'}
            </p>
            <Link
              to="/products"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
            >
              Back to Spices
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isInStock = product.inventory && product.inventory.length > 0 && product.inventory[0].quantity > 0;
  const stockQuantity = product.inventory && product.inventory.length > 0 ? product.inventory[0].quantity : 0;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Navigation */}
      <div className="bg-card border-b pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/products"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Spices
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0].imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                  <span className="text-muted-foreground text-lg">Spice Image</span>
                </div>
              )}
            </div>
            
            {/* Image Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image, i) => (
                  <div
                    key={image.id}
                    className="aspect-square bg-muted rounded-md overflow-hidden"
                  >
                    <img
                      src={image.imageUrl}
                      alt={`${product.name} ${i + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {(() => {
                    // Calculate average rating from reviews
                    const averageRating = reviews?.data.list && reviews.data.list.length > 0 
                      ? reviews.data.list.reduce((sum: number, review: Review) => {
                          const rating = typeof review.rating === 'string' ? parseFloat(review.rating) : review.rating;
                          return sum + (rating || 0);
                        }, 0) / reviews.data.list.length
                      : product.rating || 0;
                    
                    return [...Array(5)].map((_, i) => {
                      const starValue = i + 1;
                      const isHalfStar = averageRating % 1 !== 0 && Math.ceil(averageRating) === starValue;
                      const isFullStar = averageRating >= starValue;
                      
                      return (
                        <div key={i} className="relative">
                          {isHalfStar ? (
                            <>
                              {/* Half star (left side) */}
                              <div className="absolute left-0 top-0 w-2.5 h-5 overflow-hidden">
                                <Star
                                  className="w-5 h-5 text-amber-600 fill-current"
                                  style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
                                />
                              </div>
                              {/* Empty star (right side) */}
                              <Star className="w-5 h-5 text-muted-foreground" />
                            </>
                          ) : (
                            <Star
                              className={`w-5 h-5 ${
                                isFullStar
                                  ? 'text-amber-600 fill-current'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          )}
                        </div>
                      );
                    });
                  })()}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({(() => {
                      const averageRating = reviews?.data.list && reviews.data.list.length > 0 
                        ? reviews.data.list.reduce((sum: number, review: Review) => {
                            const rating = typeof review.rating === 'string' ? parseFloat(review.rating) : review.rating;
                            return sum + (rating || 0);
                          }, 0) / reviews.data.list.length
                        : product.rating || 0;
                      return averageRating.toFixed(1);
                    })()})
                  </span>
                </div>
                {reviews?.data.list && reviews.data.list.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {reviews.data.list.length} reviews
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div>
              <span className="text-3xl font-bold text-foreground">
                ${product.price.toFixed(2)}
              </span>
            </div>

            {/* Stock Status */}
            <div>
              {isInStock ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">
                    In Stock ({stockQuantity} available)
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  onClick={handleCartAction}
                  disabled={!isInStock || loading}
                  variant={isInCart ? "secondary" : "outline"}
                  className={`flex-1 py-3 ${isInCart ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300' : ''}`}
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
                          <Trash2 className="w-5 h-5 mr-2" />
                          Remove from Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          {isInStock ? 'Add to Cart' : 'Out of Stock'}
                        </>
                      )}
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={!isInStock || loading}
                  className="flex-1 py-3"
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Categories */}
            {product.category && product.category.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-foreground mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {product.category.map((cat) => (
                    <span
                      key={cat.id}
                      className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Product Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Product Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                    product.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="text-sm text-foreground">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated:</span>
                  <span className="text-sm text-foreground">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
          <div className="mt-16 border-t pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Review Form */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Write a Review
              </h2>
              
              <ReviewForm
                productId={productId}
                userReview={userReview ? {
                  rating: userReview.rating,
                  comment: userReview.comment || ''
                } : undefined}
                onEdit={!!userReview}
              />
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Customer Reviews
                {reviews?.data.list && reviews.data.list.length > 0 && (
                  <span className="text-lg font-normal text-muted-foreground ml-2">
                    ({reviews.data.list.length})
                  </span>
                )}
              </h2>
              
              <ReviewList
                productID={productId}
                emptyMessage="No reviews yet. Be the first to review this product!"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
