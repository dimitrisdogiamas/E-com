


export default function ProductDetailsPage({ params }: { params: { id: string } }) {

  const { id } = params

  //Dummy data
  const product = { id, name: 'T-Shirt', price: 19.99, description: 'A comfortable t-shirt made of 100% cotton.' };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
      <p className="text-gray-700 mb-4">${product.price.toFixed(2)}</p>
      <p className="text-gray-600">{product.description}</p>
      <button className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
        Add to Cart
      </button>
    </div>
  )
}