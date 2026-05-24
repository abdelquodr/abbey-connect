import request from 'supertest';
import httpStatus from 'http-status';
import moment from 'moment';
import setupTestDB from '../utils/setupTestDb';
import app from '../../src/app';
import { insertUsers, userOne, userTwo } from '../fixtures/user.fixture';
import prisma from '../../src/client';
import { tokenService } from '../../src/services';
import config from '../../src/config/config';
import { TokenType } from '@prisma/client';

setupTestDB();

describe('Connections integration', () => {
  test('should create, list, accept and remove a connection', async () => {
    // Insert two users
    await insertUsers([userOne, userTwo]);

    const dbUserOne = await prisma.user.findUnique({ where: { email: userOne.email } });
    const dbUserTwo = await prisma.user.findUnique({ where: { email: userTwo.email } });
    expect(dbUserOne).toBeDefined();
    expect(dbUserTwo).toBeDefined();

    // Generate access tokens for both users
    const accessExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const tokenOne = tokenService.generateToken(dbUserOne!.id, accessExpires, TokenType.ACCESS);
    const tokenTwo = tokenService.generateToken(dbUserTwo!.id, accessExpires, TokenType.ACCESS);

    // User one creates a connection request to user two
    const createRes = await request(app)
      .post('/v1/connections')
      .set('Authorization', `Bearer ${tokenOne}`)
      .send({ recipientId: dbUserTwo!.id, note: 'Hello!' })
      .expect(httpStatus.CREATED);

    expect(createRes.body).toMatchObject({
      requesterId: dbUserOne!.id,
      recipientId: dbUserTwo!.id,
      note: 'Hello!',
      status: 'PENDING'
    });

    const connectionId = createRes.body.id;

    // User one lists their connections
    const listOne = await request(app)
      .get('/v1/connections')
      .set('Authorization', `Bearer ${tokenOne}`)
      .expect(httpStatus.OK);

    expect(Array.isArray(listOne.body)).toBe(true);
    expect(listOne.body.some((c: any) => c.id === connectionId)).toBe(true);

    // User two lists their connections (should see the incoming request)
    const listTwo = await request(app)
      .get('/v1/connections')
      .set('Authorization', `Bearer ${tokenTwo}`)
      .expect(httpStatus.OK);
    expect(listTwo.body.some((c: any) => c.id === connectionId)).toBe(true);

    // User two accepts the request
    const acceptRes = await request(app)
      .patch(`/v1/connections/${connectionId}`)
      .set('Authorization', `Bearer ${tokenTwo}`)
      .send({ status: 'ACCEPTED' })
      .expect(httpStatus.OK);

    expect(acceptRes.body).toMatchObject({ id: connectionId, status: 'ACCEPTED' });

    // User one removes the connection
    await request(app)
      .delete(`/v1/connections/${connectionId}`)
      .set('Authorization', `Bearer ${tokenOne}`)
      .expect(httpStatus.NO_CONTENT);

    // Ensure it's deleted
    const found = await prisma.connection.findUnique({ where: { id: connectionId } });
    expect(found).toBeNull();
  });
});
