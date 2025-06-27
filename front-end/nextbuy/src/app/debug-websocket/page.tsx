'use client';

import { Container, Typography } from '@mui/material';
import { WebSocketDebug } from '../components/debug/WebSocketDebug';

export default function DebugWebSocketPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        WebSocket Debug Tools
      </Typography>
      <WebSocketDebug />
    </Container>
  );
} 