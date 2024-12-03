import { createSeedClient } from '@snaplet/seed';
import { parseArgs } from 'node:util';

import devSeed from './development.seed.js';

async function main() {
  const {
    values: { environment },
  } = parseArgs({ options: { environment: { type: 'string' } } });

  try {
    const client = await createSeedClient();

    if (!client) throw new Error("Seed client wasn't generated");

    // Truncate all tables in the database (except migrations and users)
    await client.$resetDatabase([
      '!drizzle.__drizzle_migrations',
      '!public.users',
    ]);

    switch (environment) {
      case 'development':
        await devSeed(client);
        break;
      case 'production':
        throw new Error('No production seeds');
        break;
      default:
        throw new Error('Provide proper --environment');
        break;
    }

    console.log('Database seeded successfully!');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
