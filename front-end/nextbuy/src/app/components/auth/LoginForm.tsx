import { Box, Typography, TextField, Button } from '@mui/material';
import React from 'react';


const LoginForm: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email:', email);
    console.log('Password:', password);

    // backend connection logic here 
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