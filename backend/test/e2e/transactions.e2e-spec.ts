import {
  createAdmin,
  createTestApp,
  registerUser,
  resetDatabase,
  TestContext,
  topUp,
  transfer,
} from '../utils/test-app.js';

interface ListBody<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

describe('Transactions', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });
  beforeEach(() => resetDatabase(ctx.prisma));
  afterAll(() => ctx.app.close());

  describe('GET /top_transactions_per_user', () => {
    it('200: returns an empty list for a user without transactions', async () => {
      const token = await registerUser(ctx, 'alice');

      const { body } = await ctx
        .http()
        .get('/top_transactions_per_user')
        .set('Authorization', token)
        .expect(200);

      expect(body).toEqual([]);
    });

    it('200: ranks credits and debits by absolute value, debits negative', async () => {
      const alice = await registerUser(ctx, 'alice');
      const bob = await registerUser(ctx, 'bob');
      await registerUser(ctx, 'carol');
      await topUp(ctx, alice, 1000);
      await topUp(ctx, bob, 1000);
      await transfer(ctx, alice, 'bob', 100);
      await transfer(ctx, bob, 'alice', 300);
      await transfer(ctx, alice, 'carol', 200);
      await transfer(ctx, bob, 'alice', 50);

      const { body } = await ctx
        .http()
        .get('/top_transactions_per_user')
        .set('Authorization', alice)
        .expect(200);

      // Top-ups are not transfers and are therefore not listed.
      expect(body).toEqual([
        { username: 'bob', amount: 300 },
        { username: 'carol', amount: -200 },
        { username: 'bob', amount: -100 },
        { username: 'bob', amount: 50 },
      ]);
    });

    it('200: returns at most 10 transactions', async () => {
      const alice = await registerUser(ctx, 'alice');
      await registerUser(ctx, 'bob');
      await topUp(ctx, alice, 1000);
      for (let amount = 1; amount <= 12; amount++) {
        await transfer(ctx, alice, 'bob', amount);
      }

      const { body } = await ctx
        .http()
        .get('/top_transactions_per_user')
        .set('Authorization', alice)
        .expect(200);

      expect(body).toHaveLength(10);
      expect(body[0]).toEqual({ username: 'bob', amount: -12 });
      expect(body[9]).toEqual({ username: 'bob', amount: -3 });
    });

    it('401: requires a token', async () => {
      await ctx.http().get('/top_transactions_per_user').expect(401);
    });
  });

  describe('GET /top_users', () => {
    it('200: ranks users by the total value of their outbound transfers', async () => {
      const alice = await registerUser(ctx, 'alice');
      const bob = await registerUser(ctx, 'bob');
      await registerUser(ctx, 'carol');
      await topUp(ctx, alice, 5000);
      await topUp(ctx, bob, 5000);
      await transfer(ctx, alice, 'bob', 100);
      await transfer(ctx, alice, 'carol', 150);
      await transfer(ctx, bob, 'carol', 1000);

      const { body } = await ctx
        .http()
        .get('/top_users')
        .set('Authorization', alice)
        .expect(200);

      expect(body).toEqual([
        { username: 'bob', transacted_value: 1000 },
        { username: 'alice', transacted_value: 250 },
        { username: 'carol', transacted_value: 0 },
      ]);
    });

    it('200: returns at most 10 users', async () => {
      const tokens = await Promise.all(
        Array.from({ length: 12 }, (_, i) => registerUser(ctx, `user${i}`)),
      );

      const { body } = await ctx
        .http()
        .get('/top_users')
        .set('Authorization', tokens[0])
        .expect(200);

      expect(body).toHaveLength(10);
    });

    it('401: requires a token', async () => {
      await ctx.http().get('/top_users').expect(401);
    });
  });

  describe('GET /transactions', () => {
    let alice: string;

    beforeEach(async () => {
      alice = await registerUser(ctx, 'alice');
      const bob = await registerUser(ctx, 'bob');
      await registerUser(ctx, 'carol');
      await topUp(ctx, alice, 1000);
      await topUp(ctx, bob, 1000);
      await transfer(ctx, alice, 'bob', 100);
      await transfer(ctx, bob, 'alice', 40);
      await transfer(ctx, alice, 'carol', 250);
      // Not involving alice: must never be listed for her.
      await transfer(ctx, bob, 'carol', 5);
    });

    async function list(query: Record<string, string | number> = {}) {
      const { body } = await ctx
        .http()
        .get('/transactions')
        .query(query)
        .set('Authorization', alice)
        .expect(200);
      return body as ListBody<{
        type: string;
        username: string | null;
        amount: number;
      }>;
    }

    it('200: lists the user transactions, newest first', async () => {
      const body = await list();

      expect(body.meta).toEqual({
        page: 1,
        limit: 10,
        total: 4,
        total_pages: 1,
      });
      expect(
        body.data.map(({ type, username, amount }) => ({
          type,
          username,
          amount,
        })),
      ).toEqual([
        { type: 'debit', username: 'carol', amount: -250 },
        { type: 'credit', username: 'bob', amount: 40 },
        { type: 'debit', username: 'bob', amount: -100 },
        { type: 'topup', username: null, amount: 1000 },
      ]);
      expect(body.data[0]).toEqual({
        id: expect.any(String),
        type: 'debit',
        username: 'carol',
        amount: -250,
        created_at: expect.any(String),
      });
    });

    it('200: paginates', async () => {
      const body = await list({ page: 2, limit: 3 });

      expect(body.meta).toEqual({
        page: 2,
        limit: 3,
        total: 4,
        total_pages: 2,
      });
      expect(body.data).toHaveLength(1);
    });

    it.each([
      [{ type: 'credit' }, [40]],
      [{ type: 'debit' }, [-250, -100]],
      [{ type: 'topup' }, [1000]],
      [{ search: 'CAR' }, [-250]],
      [{ min_amount: 50, max_amount: 300 }, [-250, -100]],
      [{ sort: 'amount', order: 'asc' }, [40, -100, -250, 1000]],
    ])('200: filters with %o', async (query, amounts) => {
      const body = await list(query);

      expect(body.data.map((item) => item.amount)).toEqual(amounts);
    });

    it('200: filters by date range', async () => {
      const today = new Date().toISOString().slice(0, 10);

      expect(
        (await list({ start_date: today, end_date: today })).meta.total,
      ).toBe(4);
      expect((await list({ end_date: '2000-01-01' })).meta.total).toBe(0);
    });

    it.each([
      { page: 0 },
      { limit: 101 },
      { type: 'transfer' },
      { start_date: 'not-a-date' },
      { min_amount: 10, max_amount: 1 },
      { start_date: '2024-10-02', end_date: '2024-10-01' },
    ])('400: rejects %o', async (query) => {
      await ctx
        .http()
        .get('/transactions')
        .query(query)
        .set('Authorization', alice)
        .expect(400);
    });

    it('401: requires a token', async () => {
      await ctx.http().get('/transactions').expect(401);
    });
  });

  describe('GET /admin/transactions', () => {
    let admin: string;
    let alice: string;

    beforeEach(async () => {
      admin = await createAdmin(ctx);
      alice = await registerUser(ctx, 'alice');
      const bob = await registerUser(ctx, 'bob');
      await topUp(ctx, alice, 1000);
      await topUp(ctx, bob, 500);
      await transfer(ctx, alice, 'bob', 100);
      await transfer(ctx, bob, 'alice', 30);
    });

    async function list(query: Record<string, string | number> = {}) {
      const { body } = await ctx
        .http()
        .get('/admin/transactions')
        .query(query)
        .set('Authorization', admin)
        .expect(200);
      return body as ListBody<{
        type: string;
        from_username: string | null;
        to_username: string;
        amount: number;
      }>;
    }

    it('200: lists the transactions of every user', async () => {
      const body = await list();

      expect(body.meta.total).toBe(4);
      expect(
        body.data.map(({ type, from_username, to_username, amount }) => ({
          type,
          from_username,
          to_username,
          amount,
        })),
      ).toEqual([
        {
          type: 'transfer',
          from_username: 'bob',
          to_username: 'alice',
          amount: 30,
        },
        {
          type: 'transfer',
          from_username: 'alice',
          to_username: 'bob',
          amount: 100,
        },
        { type: 'topup', from_username: null, to_username: 'bob', amount: 500 },
        {
          type: 'topup',
          from_username: null,
          to_username: 'alice',
          amount: 1000,
        },
      ]);
    });

    it.each([
      [{ type: 'topup' }, [500, 1000]],
      [{ type: 'transfer', username: 'alice' }, [30, 100]],
      [{ search: 'OB' }, [30, 100, 500]],
      [{ max_amount: 100 }, [30, 100]],
    ])('200: filters with %o', async (query, amounts) => {
      const body = await list(query);

      expect(body.data.map((item) => item.amount)).toEqual(amounts);
    });

    it('403: rejects regular users', async () => {
      await ctx
        .http()
        .get('/admin/transactions')
        .set('Authorization', alice)
        .expect(403);
    });

    it('401: requires a token', async () => {
      await ctx.http().get('/admin/transactions').expect(401);
    });
  });
});
