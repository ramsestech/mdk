import { describe, it, expect } from 'vitest';
import { validateFeatureName, validateType } from '../../commands/feature-start';

describe('validateFeatureName', () => {
  it('accepts kebab-case', () => {
    expect(() => validateFeatureName('rs-foo-bar')).not.toThrow();
  });

  it('rejects camelCase', () => {
    expect(() => validateFeatureName('rsFooBar')).toThrow(/kebab-case/);
  });

  it('rejects names with /', () => {
    expect(() => validateFeatureName('foo/bar')).toThrow();
  });

  it('rejects empty', () => {
    expect(() => validateFeatureName('')).toThrow();
  });
});

describe('validateType', () => {
  it('accepts api, component, permission, constraint', () => {
    for (const t of ['api', 'component', 'permission', 'constraint']) {
      expect(() => validateType(t)).not.toThrow();
    }
  });

  it('rejects other values', () => {
    expect(() => validateType('feature')).toThrow();
  });
});
