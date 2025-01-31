# Sneakers store

## Development

- [Frontend preparation](/apps/web-store/README.md)
- [Dashboard preparation](/apps/dashboard/README.md)
- [Backend preparation](/apps/backend/README.md)

Build contracts lib:

```bash
pnpm -F contracts build
```

Build auth lib:

```bash
pnpm -F next-auth build
```

Run the development server for backend:

```bash
pnpm api:dev
```

Run the development servers for frontend:

```bash
pnpm dev
```

## TODO

- [x] products and filters
- [x] featured products
- [x] search by products
- [ ] cart
- [ ] payment and orders
- [ ] favorites
- [ ] rating and comments
- [ ] simple analytics in dashboard
- [ ] improve build process
- [ ] deploy
