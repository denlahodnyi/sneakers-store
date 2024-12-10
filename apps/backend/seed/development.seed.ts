import type { SeedClient } from '@snaplet/seed';

import colors from './data/colors.json';
import sizes from './data/sizes.json';

export default async function seedData(seed: SeedClient) {
  await seed.colors(colors.map((o) => ({ ...o, id: crypto.randomUUID() })));
  await seed.colors(sizes.map((o) => ({ ...o, id: crypto.randomUUID() })));
}
