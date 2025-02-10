// We cannot import contractClient to the client component,
// using index file that exports both contractClient and contractsServerClient from the same index, cause
// contractsServerClient.ts uses "server-only". That's why we need separate
// entrypoint or client components
export * from '../contractsClient';
