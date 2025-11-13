import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderCardSkeleton() {
  return (
    <Card className="w-full shadow-md border-l-4 border-l-primary/30">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-5">
        {/* Flight Route Skeleton */}
        <div className="p-4 sm:p-5 rounded-xl border border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left flex-1 space-y-2">
              <Skeleton className="h-7 w-16 mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-24 mx-auto sm:mx-0" />
              <Skeleton className="h-5 w-16 mx-auto sm:mx-0" />
            </div>

            <div className="flex sm:flex-col items-center justify-center px-4 sm:px-6">
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>

            <div className="text-center sm:text-right flex-1 space-y-2">
              <Skeleton className="h-7 w-16 mx-auto sm:mx-0 sm:ml-auto" />
              <Skeleton className="h-4 w-32 mx-auto sm:mx-0 sm:ml-auto" />
              <Skeleton className="h-4 w-24 mx-auto sm:mx-0 sm:ml-auto" />
              <Skeleton className="h-5 w-16 mx-auto sm:mx-0 sm:ml-auto" />
            </div>
          </div>
        </div>

        {/* Booking Details Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3 rounded-lg bg-secondary/30">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="p-3 rounded-lg bg-secondary/30">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="p-3 rounded-lg bg-secondary/30">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="p-3 rounded-lg bg-secondary/30">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Actions Skeleton */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
          <Skeleton className="h-9 w-full sm:w-32" />
          <Skeleton className="h-9 w-full sm:w-36" />
          <Skeleton className="h-9 w-full sm:w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
