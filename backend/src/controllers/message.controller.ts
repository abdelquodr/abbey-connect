import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { messageService } from '../services';

const listMessages = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)!.id;
  const connectionId = Number(req.query.connectionId);
  const messages = await messageService.listMessagesForConnection(connectionId, userId);
  res.status(httpStatus.OK).send({ results: messages });
});

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)!.id;
  const { connectionId, content } = req.body as { connectionId: number; content: string };
  const message = await messageService.sendMessage(Number(connectionId), userId, content);
  res.status(httpStatus.CREATED).send(message);
});

const deleteMessage = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)!.id;
  await messageService.deleteMessage(Number(req.params.messageId), userId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  listMessages,
  sendMessage,
  deleteMessage
};
