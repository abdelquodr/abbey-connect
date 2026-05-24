import { Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/ApiError';

const getAuthorizedConnection = async (connectionId: number, userId: number) => {
  const connection = await prisma.connection.findFirst({
    where: {
      id: connectionId,
      status: 'ACCEPTED',
      OR: [{ requesterId: userId }, { recipientId: userId }]
    },
    include: {
      requester: {
        select: {
          id: true,
          email: true,
          name: true,
          headline: true,
          city: true,
          avatarUrl: true
        }
      },
      recipient: {
        select: {
          id: true,
          email: true,
          name: true,
          headline: true,
          city: true,
          avatarUrl: true
        }
      }
    }
  });

  if (!connection) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Connection not available');
  }

  return connection;
};

const listMessagesForConnection = async (connectionId: number, userId: number) => {
  await getAuthorizedConnection(connectionId, userId);

  return prisma.message.findMany({
    where: { connectionId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      content: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          email: true,
          name: true,
          headline: true,
          avatarUrl: true
        }
      }
    }
  });
};

const sendMessage = async (connectionId: number, senderId: number, content: string) => {
  await getAuthorizedConnection(connectionId, senderId);

  return prisma.message.create({
    data: {
      connectionId,
      senderId,
      content
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          email: true,
          name: true,
          headline: true,
          avatarUrl: true
        }
      }
    }
  });
};

const deleteMessage = async (messageId: number, userId: number) => {
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      senderId: userId
    }
  });

  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }

  await prisma.message.delete({ where: { id: messageId } });
};

export default {
  listMessagesForConnection,
  sendMessage,
  deleteMessage
};
