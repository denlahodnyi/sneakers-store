import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./nextAuthConfig.ts'],
  format: ['esm', 'cjs'],
  clean: true,
  minify: true,
  dts: true,
});
