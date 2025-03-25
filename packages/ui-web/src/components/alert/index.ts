// src/components/alerts/index.ts
export * from './types';
export * from './useAlerts';
export { default as ClientAlertIcon } from './ClientAlertIcon';
export { createServerAlert } from './actions';

/*
// src/app/layout.tsx
import { ClientAlertIcon } from '@/components/alerts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="flex justify-between items-center p-4 bg-white shadow">
          <div>Your Logo</div>
          <div className="flex items-center space-x-4">
<ClientAlertIcon />
    </div>
    </header>
    < main > { children } </main>
    </body>
    </html>
  );
}
*/

// Example usage in a server component:
/*
// src/app/products/page.tsx
import { createServerAlert } from '@/components/alerts';
import { AlertType } from '@/components/alerts/types';

export default async function ProductsPage() {
  async function createProduct(formData: FormData) {
    'use server';

    try {
      // Create product logic

      // Create a success alert
      await createServerAlert({
        title: 'Product Created',
        message: 'Your product has been created successfully',
        alertType: AlertType.SUCCESS,
        path: '/products',
      });

    } catch (error) {
      // Create an error alert
      await createServerAlert({
        title: 'Error',
        message: 'Failed to create product',
        alertType: AlertType.ERROR,
        details: error.message,
        path: '/products',
      });
    }
  }

  return (
    <div>
      <h1>Products</h1>
      <form action={createProduct}>
<button type="submit" > Create Product </button>
    </form>
    </div>
  );
}
*/

// Example usage in a client component:
/*
'use client';

import { useAlerts } from '@/components/alerts';
import { useState } from 'react';

export function AddToCartButton({ productId, productName }) {
  const { addSuccessAlert, addErrorAlert, addConfirmAlert } = useAlerts();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });
      
      if (!response.ok) throw new Error('Failed to add item to cart');
      
      addSuccessAlert(
        'Added to Cart',
        `${productName} has been added to your cart.`
      );
    } catch (error) {
      addErrorAlert(
        'Error',
        'Could not add item to cart',
        error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = () => {
    addConfirmAlert(
      'Confirm Purchase',
      'Would you like to proceed to checkout?',
      (confirmed) => {
        if (confirmed) {
          // Redirect to checkout
          window.location.href = '/checkout';
        }
      }
    );
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isLoading ? 'Adding...' : 'Add to Cart'}
      </button>
      <button
        onClick={handleBuyNow}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Buy Now
      </button>
    </div>
  );
}
*/