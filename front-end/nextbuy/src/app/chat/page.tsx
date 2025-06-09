'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/components/context/AuthContext';
import { useSocket } from '@/app/hooks/useSocket';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Divider,
  Alert,
  Chip,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import {
  Send as SendIcon,
  Circle as OnlineIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

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
}

export default function ChatPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const {
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
  } = useSocket();

  const [currentRoom, setCurrentRoom] = useState<string>('general');
  const [messageInput, setMessageInput] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newRoomDialog, setNewRoomDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (connected) {
      // Join general room by default
      joinRoom('general');
      loadConversations();
      loadMessages('general');
    }
  }, [user, router, connected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && currentRoom) {
      sendMessage(currentRoom, messageInput.trim());
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRoomChange = (roomId: string) => {
    if (roomId !== currentRoom) {
      setCurrentRoom(roomId);
      clearMessages();
      joinRoom(roomId);
      loadMessages(roomId);
    }
  };

  const handleEditMessage = (messageId: string, currentText: string) => {
    setEditingMessage(messageId);
    setEditText(currentText);
  };

  const handleSaveEdit = () => {
    if (editingMessage && editText.trim()) {
      editMessage(editingMessage, editText.trim());
      setEditingMessage(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
    setMenuAnchor(null);
    setSelectedMessageId(null);
  };

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      handleRoomChange(newRoomName.trim().toLowerCase().replace(/\s+/g, '-'));
      setNewRoomName('');
      setNewRoomDialog(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.roomId === currentRoom && !msg.deletedAt
  );

  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">
          Please login to access chat.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 2, height: 'calc(100vh - 200px)' }}>
      <Box sx={{ display: 'flex', height: '100%', gap: 2 }}>
        {/* Sidebar - Conversations */}
        <Paper sx={{ width: 300, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">
                Chat Rooms
              </Typography>
              <IconButton
                size="small"
                onClick={() => setNewRoomDialog(true)}
                color="primary"
              >
                <AddIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge color={connected ? 'success' : 'error'} variant="dot">
                <OnlineIcon sx={{ fontSize: 12 }} />
              </Badge>
              <Typography variant="caption" color="text.secondary">
                {connected ? 'Connected' : 'Disconnected'}
              </Typography>
            </Box>
          </Box>

          <List sx={{ flexGrow: 1, overflow: 'auto' }}>
            {/* Default rooms */}
            {['general', 'support', 'random'].map((room) => (
              <ListItem
                key={room}
                button
                selected={currentRoom === room}
                onClick={() => handleRoomChange(room)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    #{room.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`#${room}`}
                  secondary={`${room.charAt(0).toUpperCase() + room.slice(1)} chat room`}
                />
              </ListItem>
            ))}

            {/* Custom rooms from conversations */}
            {conversations.filter(conv => !['general', 'support', 'random'].includes(conv)).map((room) => (
              <ListItem
                key={room}
                button
                selected={currentRoom === room}
                onClick={() => handleRoomChange(room)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                    {room.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`#${room}`}
                  secondary="Custom room"
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Main Chat Area */}
        <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Chat Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">
              #{currentRoom}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredMessages.length} messages
            </Typography>
          </Box>

          {/* Messages Area */}
          <Box
            ref={chatContainerRef}
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              p: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {filteredMessages.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No messages yet. Start the conversation!
                </Typography>
              </Box>
            ) : (
              filteredMessages.map((message, index) => {
                const isOwnMessage = message.senderId === user.id;
                const showAvatar = index === 0 || 
                  filteredMessages[index - 1].senderId !== message.senderId;

                return (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    {!isOwnMessage && showAvatar && (
                      <Avatar
                        sx={{ width: 32, height: 32, mr: 1, mt: 0.5 }}
                      >
                        {message.sender?.name?.charAt(0) || 'U'}
                      </Avatar>
                    )}
                    
                    {!isOwnMessage && !showAvatar && (
                      <Box sx={{ width: 40 }} />
                    )}

                    <Box sx={{ maxWidth: '70%' }}>
                      {showAvatar && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {isOwnMessage ? 'You' : message.sender?.name || 'Unknown'} • {formatTimestamp(message.timestamp)}
                        </Typography>
                      )}
                      
                      <Paper
                        sx={{
                          p: 1.5,
                          backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
                          color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                          position: 'relative',
                          '&:hover .message-actions': {
                            visibility: 'visible',
                          },
                        }}
                      >
                        {editingMessage === message.id ? (
                          <Box>
                            <TextField
                              fullWidth
                              multiline
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              variant="outlined"
                              size="small"
                              autoFocus
                            />
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                              <Button size="small" onClick={handleSaveEdit}>
                                Save
                              </Button>
                              <Button size="small" onClick={handleCancelEdit}>
                                Cancel
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <>
                            <Typography variant="body2">
                              {message.message}
                              {message.editedAt && (
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{ ml: 1, opacity: 0.7 }}
                                >
                                  (edited)
                                </Typography>
                              )}
                            </Typography>
                            
                            {isOwnMessage && (
                              <Box
                                className="message-actions"
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  visibility: 'hidden',
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    setMenuAnchor(e.currentTarget);
                                    setSelectedMessageId(message.id);
                                  }}
                                  sx={{ color: isOwnMessage ? 'primary.contrastText' : 'text.primary' }}
                                >
                                  <MoreIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            )}
                          </>
                        )}
                      </Paper>
                    </Box>
                  </Box>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Message Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder={`Message #${currentRoom}...`}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!connected}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || !connected}
                      color="primary"
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {!connected && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                Disconnected from server. Trying to reconnect...
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Message Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setSelectedMessageId(null);
        }}
      >
        <MenuItem
          onClick={() => {
            const message = messages.find(m => m.id === selectedMessageId);
            if (message) {
              handleEditMessage(message.id, message.message);
            }
            setMenuAnchor(null);
          }}
        >
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedMessageId) {
              handleDeleteMessage(selectedMessageId);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* New Room Dialog */}
      <Dialog open={newRoomDialog} onClose={() => setNewRoomDialog(false)}>
        <DialogTitle>Create New Chat Room</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Room Name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="e.g., project-discussion"
            helperText="Room names will be converted to lowercase with dashes"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewRoomDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateRoom} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 