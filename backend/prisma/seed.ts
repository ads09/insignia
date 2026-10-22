/**
 * Seeds the administrator account and, once, a set of demo users with a
 * month of transactions so the dashboard charts have data to show.
 *
 * Safe to run repeatedly: the administrator is upserted and the demo data is
 * only created when none of the demo users exist yet.
 */
import { existsSync } from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client.js';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const DEMO_PASSWORD = 'password123';
const DEMO_USERNAMES = [
  'alice',
  'bob',
  'charlie',
  'diana',
  'edward',
  'fiona',
  'george',
  'hannah',
  'ivan',
  'julia',
  'kevin',
  'laura',
];
const DAYS_OF_HISTORY = 30;
const TRANSACTIONS_PER_DAY = 8;
const SALT_ROUNDS = 10;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: requireEnv('DATABASE_URL') }),
});

async function main(): Promise<void> {
  await seedAdmin();
  await seedDemoData();
}

async function seedAdmin(): Promise<void> {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    console.warn('ADMIN_USERNAME / ADMIN_PASSWORD not set: skipping admin.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await prisma.user.upsert({
    where: { username },
    create: { username, passwordHash, role: 'ADMIN' },
    update: { passwordHash, role: 'ADMIN' },
  });
  console.log(`Admin "${username}" ready.`);
}

async function seedDemoData(): Promise<void> {
  const existing = await prisma.user.count({
    where: { username: { in: DEMO_USERNAMES } },
  });
  if (existing > 0) {
    console.log('Demo users already exist: skipping demo data.');
    return;
  }

  const random = mulberry32(42);
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);
  const ids = DEMO_USERNAMES.map(() => crypto.randomUUID());
  const balances = ids.map(() => 0);
  const transactions: {
    type: 'TOPUP' | 'TRANSFER';
    senderId: string | null;
    receiverId: string;
    amount: number;
    createdAt: Date;
  }[] = [];

  const start = Date.now() - DAYS_OF_HISTORY * 24 * 60 * 60 * 1000;
  for (let day = 0; day < DAYS_OF_HISTORY; day++) {
    for (let n = 0; n < TRANSACTIONS_PER_DAY; n++) {
      const createdAt = new Date(
        start + (day + (n + random()) / TRANSACTIONS_PER_DAY) * 86_400_000,
      );
      const sender = Math.floor(random() * ids.length);

      // Top up whenever the wallet runs low, otherwise transfer a part of it.
      if (balances[sender] < 100 || random() < 0.2) {
        const amount = round(500 + random() * 9_500);
        balances[sender] = round(balances[sender] + amount);
        transactions.push({
          type: 'TOPUP',
          senderId: null,
          receiverId: ids[sender],
          amount,
          createdAt,
        });
        continue;
      }

      const receiver =
        (sender + 1 + Math.floor(random() * (ids.length - 1))) % ids.length;
      const amount = round(Math.max(1, balances[sender] * random() * 0.5));
      balances[sender] = round(balances[sender] - amount);
      balances[receiver] = round(balances[receiver] + amount);
      transactions.push({
        type: 'TRANSFER',
        senderId: ids[sender],
        receiverId: ids[receiver],
        amount,
        createdAt,
      });
    }
  }

  await prisma.$transaction([
    prisma.user.createMany({
      data: DEMO_USERNAMES.map((username, i) => ({
        id: ids[i],
        username,
        passwordHash,
        balance: balances[i],
      })),
    }),
    prisma.transaction.createMany({ data: transactions }),
  ]);
  console.log(
    `Created ${DEMO_USERNAMES.length} demo users (password "${DEMO_PASSWORD}") and ${transactions.length} transactions.`,
  );
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Small deterministic PRNG so every fresh seed produces the same data. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
