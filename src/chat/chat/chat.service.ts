import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMessage(
    roomId: string,
    senderId: string,
    message: string,
    timestamp: string,
    receiverId: string,
    type: string,
  ) {
    const savedMessage = await this.prisma.chatMessage.create({
      data: {
        roomId,
        sender: {
          connect: { id: senderId },
        },
        receiver: receiverId
          ? { connect: { id: receiverId } } // link the receiver if it is provided
          : undefined,
        type,
        message,
        timestamp: new Date(timestamp),
      },
    });
    return savedMessage;
  }

  async getMessagesByRoom(roomId: string, take: number, skip: number) {
    return this.prisma.chatMessage.findMany({
      where: {
        roomId,
        deletedAt: null, // filter out deleted messages
      },
      include: {
        sender: true, // include sender details
        receiver: true, // include receiver details
      },
      orderBy: { timestamp: 'asc' },
      take, // number of messages to fetch
      skip, // number of messages to skip
    });
  }

  async deleteMessage(messageId: string) {
    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });
  }

  async editMessage(messageId: string, newMessage: string) {
    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        message: newMessage,
        editedAt: new Date(), // the editedAt field is updated to the current date
      },
    });
  }

  async markMessageAsRead(messageId: string) {
    return this.prisma.chatMessage.update({
      where: { id: messageId }, // for that message
      data: { isRead: true },
    });
  }

  async getUserConversations(userId: string) {
    const conversations = await this.prisma.chatMessage.findMany({
      where: {
        OR: [
          {
            senderId: userId,
          },
          {
            receiverId: userId,
          },
        ],
        deletedAt: null, // filter out deleted messages
      },
      distinct: ['roomId'],
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        roomId: true,
      },
    });

    // return only the roomId
    return conversations.map((conversation) => conversation.roomId);
  }
}
