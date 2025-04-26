import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        You don&apostt have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>
      <Button asChild>
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  );
}