import { Link } from 'react-router-dom';
import { Package, Layout, Share2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 text-center">
        <Package className="mx-auto h-16 w-16 text-purple-600" />
        <h1 className="mt-6 text-4xl font-bold text-gray-900 sm:text-5xl">My Stash</h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
          Create your digital inventory and share your favorite products with the world
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link to="/register">Create your stash</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto mt-24 px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <Layout className="h-8 w-8 text-purple-600" />
            <h3 className="mt-4 text-lg font-semibold">Organize Your Items</h3>
            <p className="mt-2 text-gray-600">
              Create custom categories for your tech, fashion, books, and more
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <Share2 className="h-8 w-8 text-purple-600" />
            <h3 className="mt-4 text-lg font-semibold">Share Your Collection</h3>
            <p className="mt-2 text-gray-600">
              Get a personalized link to showcase your curated items
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <h3 className="mt-4 text-lg font-semibold">Earn from Sharing</h3>
            <p className="mt-2 text-gray-600">
              Add affiliate links and track your earnings from recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Categories Preview */}
      <div className="container mx-auto mt-24 px-4 pb-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
          Popular Categories
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[
            'Tech Gadgets',
            'Fashion & Accessories',
            'Home Decor',
            'Gaming Setup',
            'Books & Media',
            'Sports Equipment',
            'Art Supplies',
            'Workspace',
          ].map((category) => (
            <div
              key={category}
              className="rounded-lg border bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="font-medium text-gray-900">{category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}