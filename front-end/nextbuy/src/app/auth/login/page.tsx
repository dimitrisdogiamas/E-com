'use client';

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";




export default function LoginPage() {
  const { login: loginContext } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      
      // αποθηκεόυμε το context γιατί μας δίνει την δυνατότητα 
      // για global state και protected routes
      await loginContext(email, password); // we await the login context from the auth context
      window.location.href = '/';

    } catch (error) {
      if( error && typeof error === 'object' && 'response' in error && (error as { response: { data: { message: string } } }).response?.data?.message){
        setError((error as { response: { data: { message: string } } }).response.data.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Login</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border border-gray-300 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border border-gray-300 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          type="submit" disabled={loading}>
        {loading ? "Loading..." : "Login"}  
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>

    </div>
  )
}