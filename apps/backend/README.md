# Sneakers store (backend)

## Getting Started

Copy environment variables from `.env.example` to `.env`. Adjust
database variables if needed.

`AUTH_SECRET` is a random value used by the Auth.js to encrypt tokens and email
verification hashes. It must be the same as for frontend and backend.

Apply migrations:

```bash
# development
$ pnpm db:migrate:dev
```

Build API contract in `/lib/contracts`

Compile and run the project:

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

Api is served at [http://localhost:3000](http://localhost:3000)

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
