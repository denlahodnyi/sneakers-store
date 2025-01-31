# Dashboard (web frontend)

## Getting Started

Copy environment variables from `.env.example` to `.env`

`AUTH_SECRET` is a random value used by the Auth.js to encrypt tokens and email
verification hashes. It must be the same as for frontend and backend.

For images upload Cloudinary is used. Create account and upload preset with
signed mode and ability to overwrite assets. Add required environment variables
defined in `.env.example`.

Build API contract in `/lib/contracts` if you didn't.

Build configuration for Auth.js in `/lib/next-auth` if you didn't.

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3002](http://localhost:3002) with your browser to see the
result.

To run both dashboard and store frontend simultaneously use different hosts
(localhost and 127.0.0.1). This will prevent sharing authentication cookies
across domains.
