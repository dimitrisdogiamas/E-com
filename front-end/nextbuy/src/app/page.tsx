export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-8">
      <h1 className="container mx-auto px-4 py-8"></h1>
      <p className="text-4xl font-bold text-center mb-4">Welcome To NextBuy </p>
        <p className="text-center text-lg">Discover the latest trends in clothing and accessories</p>
      </section>
      
      {/*  the second section is for the product*/}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols gap-4" >
          {/* Placeholder for products */}
          <div className="bg-gray-200 h-40 flex items-center justify-center">Product 1</div>
          <div className="bg-gray-200 h-40 flex items-center justify-center">Product 2</div>
          <div className="bg-gray-200 h-40 flex items-center justify-center">Product 3</div>
          <div className="bg-gray-200 h-40 flex items-center justify-center">Product 4</div>
        </div>
      </section>

      {/* third section is about the sign up page */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Join us Today!</h2>
        <p className="mb-4">Sign up now and get exclusive discount</p>
        <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
          Sign Up
        </button>
      </section>
    </div>
  )
}