import { ConnectionStatus, Prisma } from '@prisma/client';
import prisma from '../client';

const createConnectionRequest = async (requesterId: number, recipientId: number, note?: string) => {
  return prisma.connection.upsert({
    where: {
      requesterId_recipientId: {
        requesterId,
        recipientId
      }
    },
    create: {
      requesterId,
      recipientId,
      note: note ?? null,
      status: ConnectionStatus.PENDING
    },
    update: {
      note: note ?? null,
      status: ConnectionStatus.PENDING
    }
  });
};

const listConnectionsForUser = async (userId: number) => {
  return prisma.connection.findMany({
    where: {
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
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
};

const updateConnectionStatus = async (connectionId: number, status: ConnectionStatus) => {
  return prisma.connection.update({
    where: { id: connectionId },
    data: { status }
  });
};

const removeConnection = async (connectionId: number) => {
  return prisma.connection.delete({ where: { id: connectionId } });
};

export default {
  createConnectionRequest,
  listConnectionsForUser,
  updateConnectionStatus,
  removeConnection
};
