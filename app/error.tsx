'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Application error:', error);

    // Handle ChunkLoadError specifically
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      console.error('Chunk loading failed. This might be due to a deployment or network issue.');

      // Automatically reload the page after a short delay
      const timer = setTimeout(() => {
        window.location.reload();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  // If it's a chunk load error, show a specific message
  if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-2xl font-bold">Loading Issue</h2>
          <p className="text-muted-foreground">
            We&apos;re updating the page content. Reloading automatically...
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()}>
              Reload Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
