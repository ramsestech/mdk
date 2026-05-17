import { describe, it, expect } from 'vitest';
import { exec, execOrThrow } from '../core/exec';

describe('exec', () => {
  it('returns stdout for a passing command', () => {
    const result = exec('echo hello');
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe('hello');
  });

  it('captures stderr and non-zero exit for a failing command', () => {
    const result = exec('node -e "process.stderr.write(\'oops\'); process.exit(2)"');
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('oops');
  });
});

describe('execOrThrow', () => {
  it('throws on non-zero exit', () => {
    expect(() => execOrThrow('node -e "process.exit(3)"')).toThrowError(/exit 3/);
  });

  it('returns stdout on success', () => {
    expect(execOrThrow('echo world').trim()).toBe('world');
  });
});
