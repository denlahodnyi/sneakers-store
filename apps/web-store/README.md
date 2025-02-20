# Sneakers store (web frontend)

## Getting Started

Copy environment variables from `.env.example` to `.env`

`AUTH_SECRET` is a random value used by the Auth.js to encrypt tokens and email
verification hashes. It must be the same as for frontend and backend.

Google auth configuration:

1. Create project in Google Cloud
2. Create OAuth client for this project
3. Add <http://localhost:3001> and <http://localhost:3002> to Authorized JavaScript
   origins
4. Add <http://localhost:3001/api/auth/callback/google> and
   <http://localhost:3002/api/auth/callback/google> to Authorized redirect URIs
5. Add Client ID (as `AUTH_GOOGLE_ID`) and Client secret (as
   `AUTH_GOOGLE_SECRET`) to `.env`

Stripe configuration:

1. Create Stripe account. Add Publishable key and Secret key to `.env`.
2. Get Stripe webhook secret
   ([docs](https://docs.stripe.com/webhooks/quickstart)). During development
   enable listening for stripe events in your webhook.

Build API contract in `/lib/contracts` if you didn't.

Build configuration for Auth.js in `/lib/next-auth` if you didn't.

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

To run both dashboard and store frontend simultaneously use different hosts
(localhost and 127.0.0.1). This will prevent sharing authentication cookies
across domains.
