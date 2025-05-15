'use client';

import { useCartStore } from '../components/cart/cartStore';

export default function Checkout() {
  const { items, clearCart } = useCartStore();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOrder = () => {
    // here i send the order to the backend 
    alert('Order placed successfully!');
    clearCart();
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Checkout</h1>
      {items.length === 0 ? (
       <p>Your Cart is Empty</p>
      ) : (
          <> 
            <ul className="space-y-4 mb-4">
              {items.map((item) => (
                <li key={item.id} className='flex justify-between items-center'>
                  <div>
                    <h2 className="text-xl font-semibold">{item.name}</h2>
                    <p>${item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>
            <h2 className="text-2xl font-semibold">Total: ${total.toFixed(2)}</h2>
            <button
              onClick={handleOrder}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4">
              Place Order
            </button>
          </>
      )}

    </div>
  ); 
}