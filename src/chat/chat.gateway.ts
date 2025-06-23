import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat/chat.service';
import { MessageType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

@WebSocketGateway({
  cors: {
    origin:
      // if the node environment is production then we use the frontend url and the railway app url
      process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL, 'https://nextbuy-frontend.railway.app']
        : ['http://localhost:3000'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // inject the chat service, jwt service, and prisma service
  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  //handle new connection with authentication
  async handleConnection(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      console.log(`🔄 Chat client attempting connection: ${client.id}`);
      // Extract token from auth header or query
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '') ||
        client.handshake.query?.token;

      if (!token) {
        console.log(`❌ No token provided for client: ${client.id}`);
        client.emit('auth_error', {
          message: 'No authentication token provided',
        });
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token as string);
      // Get user from database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, name: true },
      });

      if (!user) {
        console.log(`❌ User not found for client: ${client.id}`);
        client.emit('auth_error', { message: 'User not found' });
        client.disconnect();
        return;
      }

      // Attach user to socket
      client.user = user;
      console.log(
        `✅ Chat client authenticated: ${client.id} (User: ${user.name})`,
      );

      // Send connection confirmation with user info
      client.emit('connected', {
        id: client.id,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        `❌ Authentication failed for client ${client.id}:`,
        error.message,
      );
      client.emit('auth_error', { message: 'Invalid authentication token' });
      client.disconnect();
    }
  }

  // handle disconnection
  handleDisconnect(@ConnectedSocket() client: AuthenticatedSocket) {
    const userName = client.user?.name || 'Unknown';
    console.log(
      `❌ Chat client disconnected: ${client.id} (User: ${userName})`,
    );
  }

  //Listen for message events from clients
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody()
    data: {
      roomId: string;
      senderId: string;
      message: string;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Ensure senderId matches authenticated user
    if (data.senderId !== client.user.id) {
      client.emit('error', { message: 'Sender ID mismatch' });
      return;
    }

    // this logs the message of the client with the data we set above
    console.log(`💬 Message from ${client.user.name} (${client.id}):`, data);

    //Broadcast the message to all clients in the room
    this.server.to(data.roomId).emit('message', data);
  }

  // Listen for joinRoom events from clients
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    client.join(roomId);
    console.log(
      `📝 User ${client.user.name} (${client.id}) joined room: ${roomId}`,
    );

    // emit a message to the room that a new user has joined
    this.server.to(roomId).emit('joinedRoom', {
      roomId,
      clientId: client.id,
      user: {
        id: client.user.id,
        name: client.user.name,
      },
    });
  }

  // save the message to the database
  @SubscribeMessage('saveMessage')
  async handleSaveMessage(
    @MessageBody()
    data: {
      roomId: string;
      senderId: string;
      message: string;
      timestamp: string;
      receiverId: string;
      type: string;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Ensure senderId matches authenticated user
    if (data.senderId !== client.user.id) {
      client.emit('error', { message: 'Sender ID mismatch' });
      return;
    }

    console.log(
      `💾 Saving message from ${client.user.name} (${client.id}):`,
      data,
    );

    try {
      // save the message to the database
      const savedMessage = await this.chatService.saveMessage(
        data.roomId,
        data.senderId,
        data.message,
        data.timestamp,
        data.receiverId || null,
        data.type as MessageType,
      );

      // broadcast the saved message to all clients in the room
      this.server.to(data.roomId).emit('message', savedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      client.emit('error', { message: 'Failed to save message' });
    }
  }

  // mark message as read
  @SubscribeMessage('markMessageAsRead')
  async handleMarkMessageAsRead(
    @MessageBody()
    data: {
      messageId: string;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    console.log(
      `📖 Marking message as read by ${client.user.name}: ${data.messageId}`,
    );

    try {
      const updatedMessage = await this.chatService.markMessageAsRead(
        data.messageId,
      );

      // modify the room about the read status
      this.server.to(updatedMessage.roomId).emit('messageRead', updatedMessage);
    } catch (error) {
      console.error('Error marking message as read:', error);
      client.emit('error', { message: 'Failed to mark message as read' });
    }
  }

  // soft delete message
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody()
    data: {
      messageId: string;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    console.log(
      `🗑️ Deleting message by ${client.user.name}: ${data.messageId}`,
    );

    try {
      // we call the deleteMessage method from the chat service
      const deletedMessage = await this.chatService.deleteMessage(
        data.messageId,
      );

      // and we emit the deleted message to the room
      this.server
        .to(deletedMessage.roomId)
        .emit('messageDeleted', deletedMessage);
    } catch (error) {
      console.error('Error deleting message:', error);
      client.emit('error', { message: 'Failed to delete message' });
    }
  }

  //Fetch messages by room with pagination
  @SubscribeMessage('getMessagesByRoom')
  async handleGetMessagesByRoom(
    @MessageBody() data: { roomId: string; take: number; skip: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    console.log(
      `📋 Fetching messages for room: ${data.roomId} by ${client.user.name}`,
    );

    try {
      // we call the getMessagesByRoom method from the chat service
      const messages = await this.chatService.getMessagesByRoom(
        data.roomId,
        data.take,
        data.skip,
      );

      // send the messages to the client
      client.emit('messages', messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      client.emit('error', { message: 'Failed to fetch messages' });
    }
  }

  // fetch user conversations
  @SubscribeMessage('getUserConversations')
  async handleGetUserConversations(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Ensure userId matches authenticated user
    if (data.userId !== client.user.id) {
      client.emit('error', { message: 'User ID mismatch' });
      return;
    }

    console.log(`📞 Fetching conversations for user: ${client.user.name}`);

    try {
      // we call the getUserConversations method from the chat service
      const conversations = await this.chatService.getUserConversations(
        data.userId,
      );
      // send the conversation to the client
      client.emit('conversations', conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      client.emit('error', { message: 'Failed to fetch conversations' });
    }
  }

  //edit message
  @SubscribeMessage('editMessage')
  async handleEditMessage(
    @MessageBody() data: { messageId: string; newMessage: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    console.log(`✏️ Editing message by ${client.user.name}: ${data.messageId}`);

    try {
      // we call the editMessage method from the chat service
      const updatedMessage = await this.chatService.editMessage(
        data.messageId,
        data.newMessage,
      );

      // emit the updated message to the room
      this.server
        .to(updatedMessage.roomId)
        .emit('messageEdited', updatedMessage);
    } catch (error) {
      console.error('Error editing message:', error);
      client.emit('error', { message: 'Failed to edit message' });
    }
  }
}
