import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/authClient';
import { createReviewSchema } from '@/lib/types';
import type { CreateReviewData, ReviewFormData } from '@/lib/types';
import { createReview } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

// Validation schema


type ReviewFormValues = z.infer<typeof createReviewSchema>;

interface ReviewFormProps {
  productId: string;
  userReview?: ReviewFormData;
  onEdit?: boolean;
}

export function ReviewForm({ 
  productId,
  userReview,
  onEdit = false 
}: ReviewFormProps) {
  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;
  
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
      productID: productId,
      userID: user?.id || '',
    },
    mode: 'onChange',
  });

  const { setValue, watch, formState: { errors, isValid } } = form;
  const watchedRating = watch('rating');
  const watchedComment = watch('comment');

  const submitReview = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      toast.success('Review submitted successfully');
      // Reset form after successful submission
      if (!onEdit) {
        form.reset({ rating: 0, comment: '', productID: productId, userID: user?.id || '' });
      }
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to submit review');
    },
  });

  // Update form when userReview changes
  useEffect(() => {
    if (userReview) {
      setValue('rating', userReview.rating);
      setValue('comment', userReview.comment || '');
    } else {
      // Reset form when no userReview
      setValue('rating', 0);
      setValue('comment', '');
    }
  }, [userReview, setValue]);

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please log in to write a review
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleRatingClick = (rating: number) => {
    setValue('rating', rating, { shouldValidate: true, shouldDirty: true });
  };

  const handleRatingHover = (rating: number) => {
    setHoveredRating(rating);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  const handleHalfStarClick = (baseRating: number) => {
    const halfRating = baseRating + 0.5;
    setValue('rating', halfRating, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data: CreateReviewData) => {
    submitReview.mutate(data);
  };

  const displayRating = hoveredRating || watchedRating;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {onEdit ? 'Edit Your Review' : 'Write a Review'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-3">
            <Label htmlFor="rating" className="text-sm font-medium">
              Rating *
            </Label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="relative">
                  {/* Half star (left side) */}
                  <button
                    type="button"
                    onClick={() => handleHalfStarClick(star - 1)}
                    onMouseEnter={() => handleRatingHover(star - 0.5)}
                    onMouseLeave={handleRatingLeave}
                    className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm transition-colors absolute left-0 top-0 w-4 h-8 overflow-hidden"
                    aria-label={`Rate ${star - 0.5} stars`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        (star - 0.5) <= displayRating
                          ? 'text-amber-600 fill-current'
                          : 'text-muted-foreground hover:text-amber-400'
                      }`}
                      style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
                    />
                  </button>
                  
                  {/* Full star */}
                  <button
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => handleRatingHover(star)}
                    onMouseLeave={handleRatingLeave}
                    className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm transition-colors"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= displayRating
                          ? 'text-amber-600 fill-current'
                          : 'text-muted-foreground hover:text-amber-400'
                      }`}
                    />
                  </button>
                </div>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {watchedRating > 0 && `${watchedRating} star${watchedRating !== 1 ? 's' : ''}`}
              </span>
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating.message}</p>
            )}
            {/* Hidden input for form validation */}
            <input
              type="hidden"
              value={watchedRating}
              onChange={() => {}} // Controlled by our custom star buttons
            />
          </div>

          {/* Comment Section */}
          <div className="space-y-3">
            <Label htmlFor="comment" className="text-sm font-medium">
              Comment (Optional)
            </Label>
            <Textarea
              id="comment"
              value={watchedComment || ''}
              onChange={(e) => setValue('comment', e.target.value, { shouldValidate: true, shouldDirty: true })}
              placeholder="Share your thoughts about this product..."
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <div>
                {errors.comment && (
                  <span className="text-destructive">{errors.comment.message}</span>
                )}
              </div>
              <div>
                {watchedComment?.length || 0}/500 characters
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isValid || submitReview.isPending || watchedRating === 0}
              className="min-w-[120px]"
            >
              {submitReview.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {onEdit ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {onEdit ? 'Update Review' : 'Submit Review'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
