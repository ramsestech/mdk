import { describe, it, expect } from 'vitest';
import { resolveRepoPaths } from '../core/repo-paths';

describe('resolveRepoPaths', () => {
  it('returns canonical paths from a base dir', () => {
    const paths = resolveRepoPaths('/home/user/Ramses');
    expect(paths.workspace).toBe('/home/user/Ramses');
    expect(paths.sdk).toBe('/home/user/Ramses/sdk');
    expect(paths.engine).toBe('/home/user/Ramses/RamsesSuperapp/superapp-v2');
  });

  it('normalises trailing slashes', () => {
    const paths = resolveRepoPaths('/home/user/Ramses/');
    expect(paths.workspace).toBe('/home/user/Ramses');
  });
});
