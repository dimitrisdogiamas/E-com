'use client'

import { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert } from '@mui/material';

import { register } from '@/app/services/authService';

export default function RegisterPage() {
  // we need to define three states for the form 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(email, password, name); // this is a callbacke function to the register
      window.location.href="/auth/login"
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error && 
        typeof (error as {response?: {data?: {message?: string}} }).response?.data?.message === 'string'
      ) {
        setError((error as { response: {data: {message: string}}}).response.data.message);
      } else {
        setError('An error occured');
      }
    } finally {
      setLoading(false);
    }
  }
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Register
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <TextField
            label="Name"
            type="name"
            fullWidth
            margin="normal"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
          {error && <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>}
        </form>
      </Box>
    </Container>
  )
}