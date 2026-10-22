import {
  createTestApp,
  resetDatabase,
  TestContext,
} from '../utils/test-app.js';

describe('POST /user', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });
  beforeEach(() => resetDatabase(ctx.prisma));
  afterAll(() => ctx.app.close());

  it('201: registers a user by username and returns a token', async () => {
    const { body } = await ctx
      .http()
      .post('/user')
      .send({ username: 'abcd' })
      .expect(201);

    expect(body).toEqual({ token: expect.any(String) });
    await ctx
      .http()
      .get('/balance')
      .set('Authorization', body.token)
      .expect(200);
  });

  it('201: accepts an optional password', async () => {
    await ctx
      .http()
      .post('/user')
      .send({ username: 'abcd', password: 'secret123' })
      .expect(201);

    const user = await ctx.prisma.user.findUniqueOrThrow({
      where: { username: 'abcd' },
    });
    expect(user.passwordHash).not.toBe('secret123');
    expect(user.role).toBe('USER');
  });

  it('201: always creates regular users', async () => {
    await ctx
      .http()
      .post('/user')
      .send({ username: 'mallory', role: 'ADMIN' })
      .expect(201);

    const user = await ctx.prisma.user.findUniqueOrThrow({
      where: { username: 'mallory' },
    });
    expect(user.role).toBe('USER');
  });

  it('409: rejects a duplicate username', async () => {
    await ctx.http().post('/user').send({ username: 'abcd' }).expect(201);

    await ctx.http().post('/user').send({ username: 'abcd' }).expect(409);
  });

  it('409: only one of concurrent duplicate registrations succeeds', async () => {
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        ctx.http().post('/user').send({ username: 'racer' }),
      ),
    );

    expect(responses.map((r) => r.status).sort((a, b) => a - b)).toEqual([
      201, 409, 409, 409, 409,
    ]);
  });

  it.each([
    {},
    { username: '' },
    { username: '   ' },
    { username: 123 },
    { username: 'abcd', password: 'short' },
  ])('400: rejects %o', async (payload) => {
    await ctx.http().post('/user').send(payload).expect(400);
  });
});
