export default function ProductsPage() {
  
  const products = [
    { id: 1, name: 'T-shirt', price: 19.99 },
    { id: 2, name: 'Jeans', price: 49.99 },
    {id: 3, name: 'Sneakers', price: 59.99 },
  ];


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-gray-200 p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-gray-700">${product.price.toFixed(2)}</p>
            <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}