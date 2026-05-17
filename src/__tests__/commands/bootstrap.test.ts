import { describe, it, expect } from 'vitest';
import { listSteps } from '../../commands/bootstrap';

describe('bootstrap step inventory', () => {
  it('declares 11 steps in canonical order', () => {
    const steps = listSteps();
    expect(steps.length).toBe(11);
    expect(steps[0].id).toBe('check-preconditions');
    expect(steps[1].id).toBe('ensure-workspace-dir');
    expect(steps[2].id).toBe('clone-sdk');
    expect(steps[3].id).toBe('clone-engine');
    expect(steps[4].id).toBe('install-hooks');
    expect(steps[5].id).toBe('build-sdk');
    expect(steps[6].id).toBe('pack-tarballs');
    expect(steps[7].id).toBe('install-sdk-tool');
    expect(steps[8].id).toBe('wire-engine-deps');
    expect(steps[9].id).toBe('engine-install');
    expect(steps[10].id).toBe('verify-doctor');
  });
});
