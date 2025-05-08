import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat/chat.service';

@WebSocketGateway(4000, { cors: { origin: '*' } }) // websocket on port 4000 with cors enabled
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  // inject the chat service
  constructor(private chatService: ChatService) {}
  //handle new connection
  handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // handle disconnection
  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
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
    @ConnectedSocket() client: Socket,
  ) {
    // this logs the message of the client with the data we set above
    console.log(`message from ${client.id}:`, data);

    //Broadcast the message to all clients in the room
    this.server.to(data.roomId).emit('message', data);
  }

  // Listen for joinRoom events from clients
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);
    console.log(`Client ${client.id} joined room: ${roomId}`);

    // emit a message to the room that a new user has joined
    this.server.to(roomId).emit('joinedRoom', { roomId, clientId: client.id });
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
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`message from ${client.id}:`, data);

    // save the message to the database
    const savedMessage = await this.chatService.saveMessage(
      data.roomId,
      data.senderId,
      data.message,
      data.timestamp,
      data.receiverId || null,
      data.type,
    );

    // broadcast the saved message to all clients in the room
    this.server.to(data.roomId).emit('message', savedMessage);
  }

  // mark message as read
  @SubscribeMessage('markMessageAsRead')
  async handleMarkMessageAsRead(
    @MessageBody()
    data: {
      messageId: string;
    },
  ) {
    console.log(`Marking message as read: ${data.messageId}`);

    const updatedMessage = await this.chatService.markMessageAsRead(
      data.messageId,
    );

    // modify the room about the read status
    this.server.to(updatedMessage.roomId).emit('messageRead', updatedMessage);
  }
  // soft delete message
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody()
    data: {
      messageId: string;
    },
  ) {
    console.log(`Deleting message: ${data.messageId}`);

    // we call the deleteMessage method from the chat service
    const deletedMessage = await this.chatService.deleteMessage(data.messageId);

    // and we emit the deleted message to the room
    this.server
      .to(deletedMessage.roomId)
      .emit('messageDeleted', deletedMessage);
  }
  //Fetch messages by room with pagination
  @SubscribeMessage('getMessagesByRoom')
  async handleGetMessagesByRoom(
    @MessageBody() data: { roomId: string; take: number; skip: number },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Fetching messages for room: ${data.roomId}`);

    // we call the getMessagesByRoom method from the chat service
    const messages = await this.chatService.getMessagesByRoom(
      data.roomId,
      data.take,
      data.skip,
    );

    // send the messages to the client
    client.emit('messages', messages);
  }

  // fetch user conversations
  @SubscribeMessage('getUserConversations')
  async handleGetUserConversations(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Fetching conversations for user: ${data.userId}`);

    // we call the getUserConversations method from the chat service
    const conversations = await this.chatService.getUserConversations(
      data.userId,
    );
    // send the conversation to the client
    client.emit('conversations', conversations);
  }

  //edit message
  @SubscribeMessage('editMessage')
  async handleEditMessage(
    @MessageBody() data: { messageId: string; newMessage: string },
  ) {
    console.log(`Editing message: ${data.messageId}`);

    // we call the editMessage method from the chat service
    const updatedMessage = await this.chatService.editMessage(
      data.messageId,
      data.newMessage,
    );

    // emit the updated message to the room
    this.server.to(updatedMessage.roomId).emit('messageEdited', updatedMessage);
  }
}
