import { useLocation, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ErrorPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.hash.slice(1));
  
  const error = params.get('error');
  const errorDescription = params.get('error_description')?.replace(/\+/g, ' ');

  const getErrorMessage = () => {
    switch (error) {
      case 'access_denied':
        return 'The verification link has expired or is invalid. Please request a new verification email.';
      default:
        return errorDescription || 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-gray-900">Authentication Error</h1>
        <p className="mb-6 text-gray-600">{getErrorMessage()}</p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/login">Return to Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}