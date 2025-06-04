'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [results, setResults] = useState({
    api: 'Testing...',
    stripe: 'Testing...',
    products: 'Testing...',
    backend: 'Testing...'
  });

  useEffect(() => {
    const testAPI = async () => {
      // Test 1: Basic backend connectivity
      try {
        const response = await fetch('http://localhost:4001/payment/config');
        if (response.ok) {
          setResults(prev => ({ ...prev, backend: '✅ Backend Connection: Working' }));
        } else {
          setResults(prev => ({ ...prev, backend: `❌ Backend: HTTP ${response.status}` }));
        }
      } catch (error: any) {
        setResults(prev => ({ ...prev, backend: `❌ Backend: ${error.message}` }));
      }

      // Test 2: Stripe configuration
      try {
        const response = await fetch('http://localhost:4001/payment/config');
        if (response.ok) {
          const data = await response.json();
          if (data.publishableKey) {
            setResults(prev => ({ ...prev, stripe: '✅ Stripe Config: Working' }));
          } else {
            setResults(prev => ({ ...prev, stripe: '❌ Stripe Config: No publishable key' }));
          }
        } else {
          setResults(prev => ({ ...prev, stripe: `❌ Stripe Config: HTTP ${response.status}` }));
        }
      } catch (error: any) {
        setResults(prev => ({ ...prev, stripe: `❌ Stripe Config: ${error.message}` }));
      }

      // Test 3: Products API
      try {
        const response = await fetch('http://localhost:4001/products?limit=1');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setResults(prev => ({ ...prev, products: '✅ Products API: Working' }));
          } else {
            setResults(prev => ({ ...prev, products: '❌ Products API: No data' }));
          }
        } else {
          setResults(prev => ({ ...prev, products: `❌ Products API: HTTP ${response.status}` }));
        }
      } catch (error: any) {
        setResults(prev => ({ ...prev, products: `❌ Products API: ${error.message}` }));
      }

      // Test 4: General API health
      try {
        const response = await fetch('http://localhost:4001/products?limit=1');
        if (response.ok) {
          setResults(prev => ({ ...prev, api: '✅ API Connection: Working' }));
        } else {
          setResults(prev => ({ ...prev, api: `❌ API: HTTP ${response.status}` }));
        }
      } catch (error: any) {
        setResults(prev => ({ ...prev, api: `❌ API: ${error.message}` }));
      }
    };

    testAPI();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 NextBuy Frontend API Test</h1>
      
      <div style={{ marginTop: '30px', background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h3>🔍 Test Results:</h3>
        <div style={{ display: 'grid', gap: '12px', marginTop: '15px' }}>
          <div style={{ padding: '8px', background: 'white', borderRadius: '4px' }}>{results.backend}</div>
          <div style={{ padding: '8px', background: 'white', borderRadius: '4px' }}>{results.api}</div>
          <div style={{ padding: '8px', background: 'white', borderRadius: '4px' }}>{results.stripe}</div>
          <div style={{ padding: '8px', background: 'white', borderRadius: '4px' }}>{results.products}</div>
        </div>
      </div>

      <div style={{ marginTop: '30px', background: '#e8f4f8', padding: '20px', borderRadius: '8px' }}>
        <h3>📊 System Status:</h3>
        <p><strong>Backend:</strong> http://localhost:4001</p>
        <p><strong>Frontend:</strong> http://localhost:3000</p>
        <p><strong>Node ENV:</strong> {process.env.NODE_ENV || 'development'}</p>
        <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}</p>
      </div>

      <div style={{ marginTop: '30px', background: '#f0f8e8', padding: '20px', borderRadius: '8px' }}>
        <h3>🔄 Manual Test Commands:</h3>
        <div style={{ background: '#333', color: '#fff', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
          <div>curl -X GET "http://localhost:4001/payment/config"</div>
          <div>curl -X GET "http://localhost:4001/products?limit=3"</div>
        </div>
      </div>
    </div>
  );
} 