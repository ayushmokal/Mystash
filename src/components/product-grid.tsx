import type { Product } from '@/types/firebase';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
        <p className="text-gray-500">No items in this stash yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="group overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="aspect-square overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium">{product.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
            {product.affiliateLink && (
              <a
                href={product.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-purple-600 hover:underline"
              >
                View Product →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}