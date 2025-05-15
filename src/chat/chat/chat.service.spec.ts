import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MessageType } from '@prisma/client';
describe('ChatService', () => {
  let service: ChatService;
  let prisma: PrismaService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: {
            chatMessage: {
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              groupBy: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveMessage', () => {
    it('should save a message', async () => {
      const mockMessage = {
        id: '1',
        roomId: 'room1',
        senderId: 'user1',
        receiverId: 'user2',
        message: 'Hello',
        type: MessageType.TEXT,
        timestamp: new Date(),
        isRead: false,
        deletedAt: null,
        editedAt: null,
      };

      jest.spyOn(prisma.chatMessage, 'create').mockResolvedValue(mockMessage);

      const result = await service.saveMessage(
        'room1',
        'user1',
        'Hello',
        new Date().toISOString(),
        'user2',
        MessageType.TEXT,
      );

      expect(prisma.chatMessage.create).toHaveBeenCalledWith({
        data: {
          roomId: 'room1',
          sender: { connect: { id: 'user1' } },
          receiver: { connect: { id: 'user2' } },
          message: 'Hello',
          type: MessageType.TEXT, // we change because we created the enum
          timestamp: expect.any(Date),
        },
      });
      expect(result).toEqual(mockMessage);
    });
  });

  describe('editMessage', () => {
    it('should edit a message', async () => {
      const mockUpdatedMessage = {
        id: '1',
        roomId: 'room1',
        senderId: 'user1',
        receiverId: 'user2',
        message: 'Updated message',
        type: MessageType.TEXT,
        timestamp: new Date(),
        isRead: false,
        deletedAt: null,
        editedAt: new Date(),
      };

      jest
        .spyOn(prisma.chatMessage, 'update')
        .mockResolvedValue(mockUpdatedMessage);
      const result = await service.editMessage('1', 'Updated message');

      expect(prisma.chatMessage.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          message: 'Updated message',
          editedAt: expect.any(Date),
        },
      });

      expect(result).toEqual(mockUpdatedMessage);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      const mockDeleteMessage = {
        id: '1',
        roomId: 'room1',
        senderId: 'user1',
        receiverId: 'user2',
        message: 'Hello',
        type: MessageType.TEXT, // we change because we created the enum
        timestamp: new Date(),
        isRead: false,
        deletedAt: new Date(),
        editedAt: null,
      };

      jest
        .spyOn(prisma.chatMessage, 'update')
        .mockResolvedValue(mockDeleteMessage);

      const result = await service.deleteMessage('1');

      expect(prisma.chatMessage.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result).toEqual(mockDeleteMessage);
    });
  });

  describe('markMessageAsRead', () => {
    it('should mark a message as read', async () => {
      const mockReadMessage = {
        id: '1',
        roomId: 'room1',
        senderId: 'user1',
        receiverId: 'user2',
        message: 'Hello',
        type: MessageType.TEXT, // we change because we created the enum
        timestamp: new Date(),
        isRead: true,
        deletedAt: null,
        editedAt: null,
      };

      jest
        .spyOn(prisma.chatMessage, 'update')
        .mockResolvedValue(mockReadMessage);
      const result = await service.markMessageAsRead('1');

      expect(prisma.chatMessage.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isRead: true },
      });
      expect(result).toEqual(mockReadMessage);
    });
  });

  describe('getMessagesByRoom', () => {
    it('should fetch messages by room', async () => {
      const mockMessages = [
        {
          id: '1',
          roomId: 'room1',
          senderId: 'user1',
          receiverId: 'user2',
          message: 'Hello',
          type: MessageType.TEXT, // we change because we created the enum
          timestamp: new Date(),
          isRead: false,
          deletedAt: null,
          editedAt: null,
        },
        {
          id: '2',
          roomId: 'room1',
          senderId: 'user2',
          receiverId: 'user1',
          message: 'Hi',
          type: MessageType.TEXT,
          timestamp: new Date(),
          isRead: false,
          deletedAt: null,
          editedAt: null,
        },
      ];

      jest
        .spyOn(prisma.chatMessage, 'findMany')
        .mockResolvedValue(mockMessages);

      const result = await service.getMessagesByRoom('room1', 10, 0);

      expect(prisma.chatMessage.findMany).toHaveBeenCalledWith({
        where: {
          roomId: 'room1',
          deletedAt: null,
        },
        include: {
          sender: true, // include sender details
          receiver: true,
        },
        orderBy: {
          timestamp: 'asc',
        },
        take: 10,
        skip: 0,
      });
      expect(result).toEqual(mockMessages);
    });
  });

  describe('getUserConversations', () => {
    it('should fetch user conversations', async () => {
      const mockConversations = [
        {
          id: '1',
          roomId: 'room1',
          senderId: 'user1',
          receiverId: 'user2',
          message: 'Hello',
          type: MessageType.TEXT,
          timestamp: new Date(),
          isRead: false,
          deletedAt: null,
          editedAt: null,
        },
        {
          id: '2',
          roomId: 'room2', // εδώ έπαιρνε 2 φορές το room1
          senderId: 'user2',
          receiverId: 'user1',
          message: 'Hi',
          type: MessageType.TEXT,
          timestamp: new Date(),
          isRead: false,
          deletedAt: null,
          editedAt: null,
        },
      ];

      jest
        .spyOn(prisma.chatMessage, 'findMany')
        .mockResolvedValue(mockConversations);

      const result = await service.getUserConversations('user1');

      expect(prisma.chatMessage.findMany).toHaveBeenCalledWith({
        distinct: ['roomId'],
        orderBy: {
          timestamp: 'desc',
        },
        where: {
          OR: [
            { senderId: 'user1' },
            {
              receiverId: 'user1',
            },
          ],
          deletedAt: null,
        },
        select: {
          roomId: true,
        },
      });
      expect(result).toEqual(['room1', 'room2']);
    });
  });
});
