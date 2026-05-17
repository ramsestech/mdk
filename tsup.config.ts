import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: false,
  clean: true,
  sourcemap: true,
  splitting: false,
  noExternal: ['semver'],
  banner: {
    js: '#!/usr/bin/env node',
  },
});
