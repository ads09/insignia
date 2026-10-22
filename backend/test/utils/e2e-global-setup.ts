import { execFileSync } from 'node:child_process';
import { TEST_DATABASE_URL } from './e2e-env.js';

/** Applies the migrations to the test database once before all suites. */
export default function setup(): void {
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'inherit',
  });
}
