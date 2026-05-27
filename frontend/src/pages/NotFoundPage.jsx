import { useEffect } from 'react';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page Not Found — ArtSpace';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8 text-violet-500" />
        </div>
        <h1 className="text-5xl font-semibold text-gray-900 mb-3">404</h1>
        <p className="text-lg font-medium text-gray-700 mb-2">Page not found</p>
        <p className="text-sm text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
          <a href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors"
    >
          Go to ArtSpace
        </a>
      </div>
    </div>
  );
}