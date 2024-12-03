import { Link, Outlet } from 'react-router-dom';
import { Package, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { Button } from './ui/button';

export function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold">My Stash</span>
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link to={`/${user.displayName}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <UserIcon className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  Login
                </Link>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}