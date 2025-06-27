'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Chip, 
  Alert,
  Grid,
  TextField,
  Divider
} from '@mui/material';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../context/AuthContext';

export const WebSocketDebug: React.FC = () => {
  const { socket, connected, forceReconnect } = useSocket();
  const { user, token, isAuthenticated } = useAuth();
  const [testMessage, setTestMessage] = useState('Hello World!');
  const [roomId, setRoomId] = useState('test-room');

  const handleSendTestMessage = () => {
    if (socket && connected) {
      socket.emit('message', {
        roomId,
        senderId: user?.id,
        message: testMessage
      });
    }
  };

  const handleJoinRoom = () => {
    if (socket && connected) {
      socket.emit('joinRoom', roomId);
    }
  };

  const getConnectionStatus = () => {
    if (!socket) return { color: 'error', text: 'No Socket' };
    if (connected) return { color: 'success', text: 'Connected' };
    return { color: 'warning', text: 'Disconnected' };
  };

  const status = getConnectionStatus();

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        🔧 WebSocket Debug Panel
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Connection Status</Typography>
          
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={`Status: ${status.text}`}
              color={status.color as any}
              sx={{ mr: 1 }}
            />
            <Chip 
              label={`Socket ID: ${socket?.id || 'N/A'}`}
              variant="outlined"
              sx={{ mr: 1 }}
            />
            <Chip 
              label={`Transport: ${socket?.io?.engine?.transport?.name || 'N/A'}`}
              variant="outlined"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Socket URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              User: {user?.email || 'Not authenticated'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Token: {token ? '✅ Present' : '❌ Missing'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}
            </Typography>
          </Box>

          <Button 
            variant="outlined" 
            onClick={forceReconnect}
            sx={{ mr: 1 }}
          >
            Force Reconnect
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Test Actions</Typography>
          
          {!connected && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              WebSocket is not connected. Please check your authentication and connection.
            </Alert>
          )}
          
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              size="small"
              sx={{ mr: 1, mb: 1 }}
            />
            <Button 
              variant="contained" 
              onClick={handleJoinRoom}
              disabled={!connected}
              size="small"
            >
              Join Room
            </Button>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              label="Test Message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              fullWidth
              size="small"
              sx={{ mb: 1 }}
            />
            <Button 
              variant="contained" 
              onClick={handleSendTestMessage}
              disabled={!connected}
              fullWidth
            >
              Send Test Message
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Troubleshooting Steps
      </Typography>
      
      <Typography variant="body2" component="div">
        <ol>
          <li>Check if backend is running on port 4001</li>
          <li>Verify you're logged in and have a valid token</li>
          <li>Check browser console for WebSocket errors</li>
          <li>Try force reconnect if status shows disconnected</li>
          <li>Verify CORS settings allow localhost:3000</li>
        </ol>
      </Typography>
    </Paper>
  );
}; 