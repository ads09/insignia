import {
  createTestApp,
  getBalance,
  registerUser,
  resetDatabase,
  TestContext,
  topUp,
  transfer,
} from '../utils/test-app.js';

describe('Wallet', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });
  beforeEach(() => resetDatabase(ctx.prisma));
  afterAll(() => ctx.app.close());

  describe('GET /balance', () => {
    it('200: starts at 0', async () => {
      const token = await registerUser(ctx, 'alice');

      const { body } = await ctx
        .http()
        .get('/balance')
        .set('Authorization', token)
        .expect(200);

      expect(body).toEqual({ balance: 0 });
    });

    it('401: requires a token', async () => {
      await ctx.http().get('/balance').expect(401);
    });
  });

  describe('POST /topup', () => {
    it('204: adds the amount to the balance', async () => {
      const token = await registerUser(ctx, 'alice');

      const response = await ctx
        .http()
        .post('/topup')
        .set('Authorization', token)
        .send({ amount: 1000 })
        .expect(204);
      await topUp(ctx, token, 0.5);

      expect(response.body).toEqual({});
      expect(await getBalance(ctx, token)).toBe(1000.5);
    });

    it('204: accepts the largest amount below the limit', async () => {
      const token = await registerUser(ctx, 'alice');

      await topUp(ctx, token, 9_999_999.99);

      expect(await getBalance(ctx, token)).toBe(9_999_999.99);
    });

    it.each([0, -1, 10_000_000, 20_000_000, 0.000000001, '100', null])(
      '400: rejects the amount %s',
      async (amount) => {
        const token = await registerUser(ctx, 'alice');

        await ctx
          .http()
          .post('/topup')
          .set('Authorization', token)
          .send({ amount })
          .expect(400);
        expect(await getBalance(ctx, token)).toBe(0);
      },
    );

    it('401: requires a valid token', async () => {
      await ctx
        .http()
        .post('/topup')
        .set('Authorization', 'invalid')
        .send({ amount: 10 })
        .expect(401);
    });
  });

  describe('POST /transfer', () => {
    let alice: string;
    let bob: string;

    beforeEach(async () => {
      alice = await registerUser(ctx, 'alice');
      bob = await registerUser(ctx, 'bob');
      await topUp(ctx, alice, 1000);
    });

    it('204: moves the amount from the sender to the destination', async () => {
      const response = await ctx
        .http()
        .post('/transfer')
        .set('Authorization', alice)
        .send({ to_username: 'bob', amount: 250.25 })
        .expect(204);

      expect(response.body).toEqual({});
      expect(await getBalance(ctx, alice)).toBe(749.75);
      expect(await getBalance(ctx, bob)).toBe(250.25);
    });

    it('204: allows transferring the whole balance', async () => {
      await transfer(ctx, alice, 'bob', 1000);

      expect(await getBalance(ctx, alice)).toBe(0);
    });

    it('400: rejects an insufficient balance', async () => {
      await ctx
        .http()
        .post('/transfer')
        .set('Authorization', alice)
        .send({ to_username: 'bob', amount: 1000.01 })
        .expect(400);

      expect(await getBalance(ctx, alice)).toBe(1000);
      expect(await getBalance(ctx, bob)).toBe(0);
    });

    it.each([
      { to_username: 'bob', amount: 0 },
      { to_username: 'bob', amount: -5 },
      { to_username: 'bob' },
      { amount: 10 },
      { to_username: 'alice', amount: 10 },
    ])('400: rejects %o', async (payload) => {
      await ctx
        .http()
        .post('/transfer')
        .set('Authorization', alice)
        .send(payload)
        .expect(400);
    });

    it('404: rejects an unknown destination user', async () => {
      await ctx
        .http()
        .post('/transfer')
        .set('Authorization', alice)
        .send({ to_username: 'ghost', amount: 10 })
        .expect(404);
    });

    it('401: requires a valid token', async () => {
      await ctx
        .http()
        .post('/transfer')
        .send({ to_username: 'bob', amount: 10 })
        .expect(401);
    });

    it('never lets the balance go negative under concurrent transfers', async () => {
      const responses = await Promise.all(
        Array.from({ length: 20 }, () =>
          ctx
            .http()
            .post('/transfer')
            .set('Authorization', alice)
            .send({ to_username: 'bob', amount: 100 }),
        ),
      );

      const statuses = responses.map((r) => r.status);
      expect(statuses.filter((s) => s === 204)).toHaveLength(10);
      expect(statuses.filter((s) => s === 400)).toHaveLength(10);
      expect(await getBalance(ctx, alice)).toBe(0);
      expect(await getBalance(ctx, bob)).toBe(1000);
    });

    it('does not deadlock on concurrent opposite transfers', async () => {
      await topUp(ctx, bob, 1000);

      const responses = await Promise.all(
        Array.from({ length: 20 }, (_, i) =>
          ctx
            .http()
            .post('/transfer')
            .set('Authorization', i % 2 ? alice : bob)
            .send({ to_username: i % 2 ? 'bob' : 'alice', amount: 10 }),
        ),
      );

      expect(responses.every((r) => r.status === 204)).toBe(true);
      expect(await getBalance(ctx, alice)).toBe(1000);
      expect(await getBalance(ctx, bob)).toBe(1000);
    });
  });
});
