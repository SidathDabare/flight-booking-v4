import { Suspense } from "react";
import HotelsLoader from "./_components/hotels-loader";
import { Loader2 } from "lucide-react";

export default function HotelsPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Searching for hotels...</p>
            </div>
          </div>
        }
      >
        <HotelsLoader />
      </Suspense>
    </div>
  );
}
