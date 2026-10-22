import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';
import { setupApp } from '../../src/app.setup.js';
import { PrismaService } from '../../src/shared/infrastructure/prisma/prisma.service.js';

export interface TestContext {
  app: INestApplication<App>;
  prisma: PrismaService;
  http: () => ReturnType<typeof request>;
}

export async function createTestApp(): Promise<TestContext> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>();
  setupApp(app);
  // Listening on a random port lets supertest reuse one server for
  // concurrent requests instead of starting one per request.
  await app.listen(0);

  return {
    app,
    prisma: app.get(PrismaService),
    http: () => request(app.getHttpServer()),
  };
}

export async function resetDatabase(prisma: PrismaService): Promise<void> {
  await prisma.$executeRaw`TRUNCATE TABLE transactions, users CASCADE`;
}

export async function registerUser(
  ctx: TestContext,
  username: string,
  password?: string,
): Promise<string> {
  const { body } = await ctx
    .http()
    .post('/user')
    .send({ username, password })
    .expect(201);
  return (body as { token: string }).token;
}

export async function createAdmin(
  ctx: TestContext,
  username = 'admin',
  password = 'admin12345',
): Promise<string> {
  await ctx.prisma.user.create({
    data: {
      username,
      role: 'ADMIN',
      passwordHash: await bcrypt.hash(password, 4),
    },
  });
  const { body } = await ctx
    .http()
    .post('/login')
    .send({ username, password })
    .expect(200);
  return (body as { token: string }).token;
}

export async function topUp(
  ctx: TestContext,
  token: string,
  amount: number,
): Promise<void> {
  await ctx
    .http()
    .post('/topup')
    .set('Authorization', token)
    .send({ amount })
    .expect(204);
}

export async function transfer(
  ctx: TestContext,
  token: string,
  toUsername: string,
  amount: number,
): Promise<void> {
  await ctx
    .http()
    .post('/transfer')
    .set('Authorization', token)
    .send({ to_username: toUsername, amount })
    .expect(204);
}

export async function getBalance(
  ctx: TestContext,
  token: string,
): Promise<number> {
  const { body } = await ctx
    .http()
    .get('/balance')
    .set('Authorization', token)
    .expect(200);
  return (body as { balance: number }).balance;
}
