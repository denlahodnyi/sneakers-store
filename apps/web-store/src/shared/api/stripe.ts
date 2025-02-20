import 'server-only';

import Stripe from 'stripe';

import { env } from '~/shared/config';

const { STRIPE_SECRET_KEY } = env;

export const stripe = new Stripe(STRIPE_SECRET_KEY);
export { Stripe };
