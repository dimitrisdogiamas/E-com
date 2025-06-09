'use client';

import { useEffect, useRef, useState } from 'react';
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
  sendMessage: (roomId: string, message: string, receiverId?: string, type?: 'TEXT' | 'IMAGE' | 'VIDEO') => void;
  editMessage: (messageId: string, newMessage: string) => void;
  deleteMessage: (messageId: string) => void;
  markAsRead: (messageId: string) => void;
  loadMessages: (roomId: string, take?: number, skip?: number) => void;
  loadConversations: () => void;
  clearMessages: () => void;
}

export function useSocket(): UseSocketReturn {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

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

    // Create socket connection
    const newSocket = io('http://localhost:4001', {
      auth: {
        token,
        userId: user.id,
      },
      transports: ['websocket', 'polling'],
    });

    // set the socket ref value to the new socket 
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
    });

    // disconnection event
    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    // connection error event
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    // Message events
    newSocket.on('message', (message: Message) => {
      console.log('Received message:', message);
      setMessages(prev => {
        const existing = prev.find(m => m.id === message.id);
        if (existing) {
          return prev.map(m => m.id === message.id ? message : m);
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
      setMessages(prev => 
        prev.map(m => m.id === updatedMessage.id ? updatedMessage : m)
      );
    });

    newSocket.on('messageDeleted', (deletedMessage: Message) => {
      console.log('Message deleted:', deletedMessage);
      setMessages(prev => 
        prev.map(m => m.id === deletedMessage.id ? deletedMessage : m)
      );
    });

    newSocket.on('messageRead', (readMessage: Message) => {
      console.log('Message marked as read:', readMessage);
      setMessages(prev => 
        prev.map(m => m.id === readMessage.id ? readMessage : m)
      );
    });

    newSocket.on('conversations', (conversationList: string[]) => {
      console.log('Received conversations:', conversationList);
      setConversations(conversationList);
    });

    newSocket.on('joinedRoom', ({ roomId, clientId }) => {
      console.log(`Joined room ${roomId} with client ${clientId}`);
    });

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user, token]);

  const joinRoom = (roomId: string) => {
    if (socket && connected) {
      socket.emit('joinRoom', roomId);
    }
  };

  const sendMessage = (
    roomId: string, 
    message: string, 
    receiverId?: string, 
    type: 'TEXT' | 'IMAGE' | 'VIDEO' = 'TEXT'
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
  };
} 