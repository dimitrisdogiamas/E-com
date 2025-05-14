// καλάθι αγορών
'use client';

import { useCartStore } from "../components/cart/cartStore";
export default function CartPage() {
  const { items, removeItem, clearCart } = useCartStore();


  const total = items.reduce((sum, item) => sum+ item.price * item.quantity, 0);
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl fotnt-bold mb-4">Your Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
          <div>
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{item.name}</h2>
                    <p>${item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <h2 className="text-2xl font-semibold">Total : ${total.toFixed(2)}</h2>
              <button
                onClick={clearCart}
                className="mt-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
              Clear Cart
              </button>
              </div>
          </div>
            )
            }
    </div>
  );
}