'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/app/components/context/AuthContext';

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  receiverId?: string;
  message: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO';
  timestamp: string;
  isRead: boolean;
  deletedAt?: string;
  editedAt?: string;
  sender?: {
    id: string;
    name: string;
    email: string;
  };
  receiver?: {
    id: string;
    name: string;
    email: string;
  };
}

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  messages: Message[];
  conversations: string[];
  joinRoom: (roomId: string) => void;
  sendMessage: (
    roomId: string,
    message: string,
    receiverId?: string,
    type?: 'TEXT' | 'IMAGE' | 'VIDEO',
  ) => void;
  editMessage: (messageId: string, newMessage: string) => void;
  deleteMessage: (messageId: string) => void;
  markAsRead: (messageId: string) => void;
  loadMessages: (roomId: string, take?: number, skip?: number) => void;
  loadConversations: () => void;
  clearMessages: () => void;
  forceReconnect: () => void;
}

export function useSocket(): UseSocketReturn {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const connectionCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Force state update function
  const forceStateUpdate = useCallback(() => {
    if (socketRef.current) {
      const isConnected = socketRef.current.connected;
      console.log('🔄 Force state update - Socket connected:', isConnected);
      setConnected(isConnected);
    }
  }, []);

  // Periodic connection check
  useEffect(() => {
    connectionCheckInterval.current = setInterval(() => {
      forceStateUpdate();
    }, 1000); // Check every second

    return () => {
      if (connectionCheckInterval.current) {
        clearInterval(connectionCheckInterval.current);
      }
    };
  }, [forceStateUpdate]);

  const forceReconnect = useCallback(() => {
    console.log('🔄 Force reconnect triggered');
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    }
    // Force re-render after cleanup
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, []);

  useEffect(() => {
    // if the user is not valid or the token is not valid then disconnect the socket and set it's value to null
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    console.log(
      `🔍 useSocket: Creating new socket connection for user: ${user.email}`,
    );

    // Create socket connection with dynamic URL
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
    console.log('🔗 Connecting to WebSocket server:', socketUrl);
    console.log('🔑 Using token:', token ? 'Present' : 'Missing');
    console.log('👤 User ID:', user.id);

    const newSocket = io(socketUrl, {
      auth: {
        token,
        userId: user.id,
      },
      query: {
        token, // Also pass token in query as fallback
      },
      transports: ['websocket', 'polling'],
      timeout: 20000, // Increase timeout
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10, // More attempts
      reconnectionDelay: 2000, // Longer delay
      reconnectionDelayMax: 5000,
    });

    // set the socket ref value to the new socket
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      console.log('✅ Socket transport:', newSocket.io.engine.transport.name);
      setConnected(true);
      // Force additional state update after short delay
      setTimeout(() => {
        setConnected(true);
        forceStateUpdate();
      }, 100);
    });

    // disconnection event
    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setConnected(false);
    });

    // connection error event
    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      console.error('❌ Error details:', error.message);
      setConnected(false);
    });

    // Reconnection events
    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      setConnected(true);
      setTimeout(() => {
        setConnected(true);
        forceStateUpdate();
      }, 100);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('🔄 Reconnection error:', error);
    });

    // Listen for connection confirmation from server
    newSocket.on('connected', (data) => {
      console.log('🎉 Chat connection confirmed:', data);
      setConnected(true);
    });

    // Message events
    newSocket.on('message', (message: Message) => {
      console.log('Received message:', message);
      setMessages((prev) => {
        const existing = prev.find((m) => m.id === message.id);
        if (existing) {
          return prev.map((m) => (m.id === message.id ? message : m));
        }
        return [...prev, message];
      });
    });

    newSocket.on('messages', (messageList: Message[]) => {
      console.log('Received messages:', messageList);
      setMessages(messageList);
    });

    newSocket.on('messageEdited', (updatedMessage: Message) => {
      console.log('Message edited:', updatedMessage);
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)),
      );
    });

    newSocket.on('messageDeleted', (deletedMessage: Message) => {
      console.log('Message deleted:', deletedMessage);
      setMessages((prev) =>
        prev.map((m) => (m.id === deletedMessage.id ? deletedMessage : m)),
      );
    });

    newSocket.on('messageRead', (readMessage: Message) => {
      console.log('Message marked as read:', readMessage);
      setMessages((prev) =>
        prev.map((m) => (m.id === readMessage.id ? readMessage : m)),
      );
    });

    newSocket.on('conversations', (conversationList: string[]) => {
      console.log('Received conversations:', conversationList);
      setConversations(conversationList);
    });

    newSocket.on('joinedRoom', ({ roomId, clientId }) => {
      console.log(`Joined room ${roomId} with client ${clientId}`);
    });

    // Authentication error handling
    newSocket.on('auth_error', (error) => {
      console.error('❌ Socket authentication error:', error);
      setConnected(false);
      // Optionally redirect to login or show error message
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user, token, forceStateUpdate]);

  const joinRoom = (roomId: string) => {
    if (socket && connected) {
      socket.emit('joinRoom', roomId);
    }
  };

  const sendMessage = (
    roomId: string,
    message: string,
    receiverId?: string,
    type: 'TEXT' | 'IMAGE' | 'VIDEO' = 'TEXT',
  ) => {
    if (socket && connected && user) {
      const messageData = {
        roomId,
        senderId: user.id,
        receiverId,
        message,
        type,
        timestamp: new Date().toISOString(),
      };
      socket.emit('saveMessage', messageData);
    }
  };

  const editMessage = (messageId: string, newMessage: string) => {
    if (socket && connected) {
      socket.emit('editMessage', { messageId, newMessage });
    }
  };

  const deleteMessage = (messageId: string) => {
    if (socket && connected) {
      socket.emit('deleteMessage', { messageId });
    }
  };

  const markAsRead = (messageId: string) => {
    if (socket && connected) {
      socket.emit('markMessageAsRead', { messageId });
    }
  };

  const loadMessages = (roomId: string, take = 50, skip = 0) => {
    if (socket && connected) {
      socket.emit('getMessagesByRoom', { roomId, take, skip });
    }
  };

  const loadConversations = () => {
    if (socket && connected && user) {
      socket.emit('getUserConversations', { userId: user.id });
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    socket,
    connected,
    messages,
    conversations,
    joinRoom,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    loadMessages,
    loadConversations,
    clearMessages,
    forceReconnect,
  };
}
