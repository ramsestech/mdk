import { describe, it, expect } from 'vitest';
import { parseNodeVersion, meetsMinVersion } from '../core/precondition-check';

describe('parseNodeVersion', () => {
  it('parses standard semver output', () => {
    expect(parseNodeVersion('v20.10.0')).toBe('20.10.0');
  });

  it('parses without v prefix', () => {
    expect(parseNodeVersion('20.10.0')).toBe('20.10.0');
  });

  it('returns null on garbage', () => {
    expect(parseNodeVersion('not a version')).toBeNull();
  });
});

describe('meetsMinVersion', () => {
  it('returns true when actual exceeds minimum', () => {
    expect(meetsMinVersion('20.10.0', '20.0.0')).toBe(true);
  });

  it('returns true when actual matches minimum', () => {
    expect(meetsMinVersion('20.0.0', '20.0.0')).toBe(true);
  });

  it('returns false when actual is below minimum', () => {
    expect(meetsMinVersion('18.19.0', '20.0.0')).toBe(false);
  });
});
