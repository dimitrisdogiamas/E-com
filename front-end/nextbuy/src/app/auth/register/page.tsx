'use client'

import { useState } from 'react'
import axios from 'axios'

export default function RegisterPage() {
  // we need to define three states for the form 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
     await axios.post('http://localhost:4000/auth/register', { email, password });
      alert('Registration successful! You can now log in.');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data.message || 'An error occured');
      } else {
        setError('An error occured');
      }
    }
  }
  return (
    <div className="">
      <h1 className="text-4xl font-bold mb-4">Register</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounder"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Register</button>
      </form>
    </div>
  )
}