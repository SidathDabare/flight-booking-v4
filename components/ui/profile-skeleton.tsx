import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Profile Cards Grid */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {/* Profile Picture Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-24" />
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          {/* Profile Information Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-64" />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Information Card */}
        <Card className="mt-6">
          <CardHeader>
            <Skeleton className="h-6 w-44 mb-2" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
