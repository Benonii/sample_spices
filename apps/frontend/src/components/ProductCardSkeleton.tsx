import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
    return (
        <Card className="overflow-hidden h-full flex flex-col glass-card dark:glass-card-dark border-orange-200/50 dark:border-orange-500/20">
            {/* Image Skeleton */}
            <div className="aspect-square w-full relative overflow-hidden bg-muted/20">
                <Skeleton className="h-full w-full" />
            </div>

            <CardContent className="p-4 flex-grow space-y-3">
                <div className="flex justify-between items-start">
                    {/* Title Skeleton */}
                    <Skeleton className="h-6 w-3/4" />
                </div>

                {/* Rating Skeleton */}
                <div className="flex items-center space-x-1">
                    <Skeleton className="h-4 w-24" />
                </div>

                {/* Price Skeleton */}
                <Skeleton className="h-8 w-1/3" />
            </CardContent>

            <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
            </CardFooter>
        </Card>
    );
}
