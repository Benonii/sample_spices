import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Review } from '@/lib/types';
import { getReviews } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from './ui/skeleton';

interface ReviewDisplayProps {
  review: Review;
}

export function ReviewDisplay({ 
  review
}: ReviewDisplayProps) {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-3">
          {/* Name and Rating Row */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">
              {review.reviewerName}
            </span>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => {
                const starValue = i + 1;
                const rating = typeof review.rating === 'string' ? parseFloat(review.rating) : review.rating;
                const isHalfStar = rating % 1 !== 0 && Math.ceil(rating) === starValue;
                const isFullStar = rating >= starValue;
                
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
            </div>
          </div>

          {/* Review Comment */}
          {review.comment && (
            <p className="text-muted-foreground leading-relaxed">
              {review.comment}
            </p>
          )}

          {/* Empty state for reviews without comments */}
          {!review.comment && (
            <p className="text-sm text-muted-foreground italic">
              No comment provided
            </p>
          )}

          {/* Date at bottom right */}
          <div className="flex justify-end">
            <span className="text-sm text-muted-foreground">
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ReviewListProps {
  productID: string;
  emptyMessage?: string;
}

export function ReviewList({ 
  productID,
  emptyMessage = "No reviews yet. Be the first to review this product!"
}: ReviewListProps) {
  const { data: reviews, isPending, error } = useQuery({
    queryKey: [`reviews`, productID],
    queryFn: () => getReviews({ productID, _start: 0, _end: 10 }),
    enabled: !!productID,
  });

  console.log('Reviews query result:', { reviews, isPending, error, productID });

  return (
    <div className="space-y-4">
      {isPending && (
        <div className="text-center py-8 space-y-4">
          <Skeleton className="w-full h-24" />
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
        </div>
      )}
      {!isPending && (!reviews?.data.list || reviews.data.list.length === 0) && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
      {reviews?.data.list && reviews.data.list.length > 0 && reviews.data.list.map((review: Review) => (
        <ReviewDisplay
          key={review.id}
          review={review}
        />
      ))}
    </div>
  );
}
