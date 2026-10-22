import {
  createAdmin,
  createTestApp,
  registerUser,
  resetDatabase,
  TestContext,
} from '../utils/test-app.js';

describe('Authentication', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });
  beforeEach(() => resetDatabase(ctx.prisma));
  afterAll(() => ctx.app.close());

  describe('POST /login', () => {
    it('200: returns a token for valid credentials', async () => {
      await registerUser(ctx, 'alice', 'secret123');

      const { body } = await ctx
        .http()
        .post('/login')
        .send({ username: 'alice', password: 'secret123' })
        .expect(200);

      expect(body).toEqual({ token: expect.any(String) });
    });

    it.each([
      { username: 'alice', password: 'wrong-password' },
      { username: 'nobody', password: 'secret123' },
    ])('401: rejects %o', async (credentials) => {
      await registerUser(ctx, 'alice', 'secret123');

      await ctx.http().post('/login').send(credentials).expect(401);
    });

    it('401: rejects users registered without a password', async () => {
      await registerUser(ctx, 'alice');

      await ctx
        .http()
        .post('/login')
        .send({ username: 'alice', password: 'anything1' })
        .expect(401);
    });

    it('400: requires username and password', async () => {
      await ctx.http().post('/login').send({ username: 'alice' }).expect(400);
    });
  });

  describe('GET /me', () => {
    it('200: returns the profile of the token owner', async () => {
      const token = await registerUser(ctx, 'alice');

      const { body } = await ctx
        .http()
        .get('/me')
        .set('Authorization', token)
        .expect(200);

      expect(body).toEqual({ username: 'alice', role: 'USER' });
    });

    it('200: reports the administrator role', async () => {
      const token = await createAdmin(ctx);

      const { body } = await ctx
        .http()
        .get('/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(body).toEqual({ username: 'admin', role: 'ADMIN' });
    });
  });

  describe('token handling', () => {
    it('accepts the token with or without the Bearer prefix', async () => {
      const token = await registerUser(ctx, 'alice');

      await ctx.http().get('/balance').set('Authorization', token).expect(200);
      await ctx
        .http()
        .get('/balance')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it.each(['', 'invalid-token', 'Bearer '])(
      '401: rejects the Authorization header "%s"',
      async (header) => {
        await ctx
          .http()
          .get('/balance')
          .set('Authorization', header)
          .expect(401);
      },
    );

    it('401: rejects the token of a deleted user', async () => {
      const token = await registerUser(ctx, 'alice');
      await resetDatabase(ctx.prisma);

      await ctx.http().get('/balance').set('Authorization', token).expect(401);
    });
  });
});
