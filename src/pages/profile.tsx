import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Settings, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  brand: string | null;
  image_url: string | null;
  affiliate_url: string | null;
  price: number | null;
  currency: string;
}

export function Profile() {
  const { username } = useParams();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);

  const isOwner = user?.user_metadata?.username === username;

  useEffect(() => {
    async function loadData() {
      try {
        // Get user profile
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single();

        if (!profiles) {
          setLoading(false);
          return;
        }

        // Get categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', profiles.id)
          .order('sort_order');

        if (categoriesData) {
          setCategories(categoriesData);

          // Get products for each category
          const productsMap: Record<string, Product[]> = {};
          await Promise.all(
            categoriesData.map(async (category) => {
              const { data: categoryProducts } = await supabase
                .from('products')
                .select('*')
                .eq('category_id', category.id)
                .order('created_at');

              if (categoryProducts) {
                productsMap[category.id] = categoryProducts;
              }
            })
          );

          setProducts(productsMap);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [username]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!categories.length && !isOwner) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-gray-500">This stash is empty</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{username}'s Stash</h1>
          <p className="mt-2 text-gray-600">
            A collection of {Object.values(products).flat().length} items in{' '}
            {categories.length} categories
          </p>
        </div>
        {isOwner && (
          <div className="flex gap-4">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-8">
        {categories.map((category) => (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{category.name}</h2>
                {category.description && (
                  <p className="text-gray-600">{category.description}</p>
                )}
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products[category.id]?.map((product) => (
                <a
                  key={product.id}
                  href={product.affiliate_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-gray-400">{product.name}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                    <h3 className="font-medium">{product.name}</h3>
                    {product.brand && (
                      <p className="text-sm text-gray-200">{product.brand}</p>
                    )}
                    {product.price && (
                      <p className="mt-1 text-sm font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: product.currency,
                        }).format(product.price)}
                      </p>
                    )}
                  </div>
                  {isOwner && (
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}