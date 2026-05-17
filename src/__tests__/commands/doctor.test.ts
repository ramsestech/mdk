import { describe, it, expect } from 'vitest';
import { formatReport } from '../../commands/doctor';

describe('doctor formatReport', () => {
  it('emits 0 exit when all pass', () => {
    const { text, exitCode } = formatReport([
      { status: 'pass', name: 'node', detail: 'v20.10.0' },
    ]);
    expect(exitCode).toBe(0);
    expect(text).toContain('node');
    expect(text).toContain('v20.10.0');
  });

  it('emits 1 exit when any fail', () => {
    const { text, exitCode } = formatReport([
      { status: 'pass', name: 'node', detail: 'v20.10.0' },
      { status: 'fail', name: 'gh CLI', detail: 'not found', fix: 'brew install gh' },
    ]);
    expect(exitCode).toBe(1);
    expect(text).toContain('FAIL');
    expect(text).toContain('brew install gh');
  });

  it('emits 0 exit when warns present but no fails', () => {
    const { exitCode } = formatReport([
      { status: 'pass', name: 'node', detail: 'v20' },
      { status: 'warn', name: 'JDK', detail: 'not found', fix: 'optional' },
    ]);
    expect(exitCode).toBe(0);
  });
});
