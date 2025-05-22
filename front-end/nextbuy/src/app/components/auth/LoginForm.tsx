import { Box, Typography, TextField, Button } from '@mui/material';
import { login } from '@/app/services/authService';
import { useState } from "react";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // backend connection logic here handle the error and the success
    try {
      const res = await login(email, password)
      
      // θα αποθηκεύουμε το token στο local storage
      localStorage.setItem('token', res.token);
      //redirect to the home page
      window.location.href="/"
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }
  return (
    <Box
      sx={{
        maxWidth: 400,
        margin: 'auto',
        padding: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant='h4' align='center'>Login</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label='Email'
          type='email'
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField label='Password' type='password' fullWidth required />
        <Button
          type='submit'
          variant='contained'
          color='primary'
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginTop: 2 }}
        >
          Login
        </Button>
      </form>
    </Box>
  );
};

export default LoginForm;