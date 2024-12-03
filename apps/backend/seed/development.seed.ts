import type { SeedClient } from '@snaplet/seed';

import colors from './data/colors.json';

export default async function seedData(seed: SeedClient) {
  await seed.colors(colors.map((o) => ({ ...o, id: crypto.randomUUID() })));
}
