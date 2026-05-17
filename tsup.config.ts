import { defineConfig } from 'tsup';
import { cpSync, mkdirSync } from 'fs';
import { join } from 'path';

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
  onSuccess: async () => {
    const src = join(__dirname, 'src', 'core', 'templates');
    const dest = join(__dirname, 'dist', 'core', 'templates');
    mkdirSync(dest, { recursive: true });
    cpSync(src, dest, { recursive: true });
  },
});
