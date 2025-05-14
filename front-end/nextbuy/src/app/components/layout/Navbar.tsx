

import  Link from 'next/link';


export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white py-4">
      <div className='container mx-auto flex justify-between items-center px-4'></div>
      <Link href="/" className="text-xl font-bold">
        NextBuy
      </Link>
      <div className="space-x-4">
        <Link href="/products" className="hover:underline">
        Products
        </Link>
        {/* route for about page */}
        <Link href="/about" className="hover:underline">
          Cart
        </Link>
        {/* route for auth login */}
        <Link href="/auth/login" className="hover:underline"></Link>
      </div>
    </nav>
  )
}