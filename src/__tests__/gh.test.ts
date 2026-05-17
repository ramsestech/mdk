import { describe, it, expect } from 'vitest';
import { parsePrListJson } from '../core/gh';

describe('parsePrListJson', () => {
  it('parses an array of PR objects', () => {
    const raw = JSON.stringify([
      { number: 42, headRefName: 'feature/foo', url: 'https://github.com/r/p/pull/42', state: 'OPEN' },
    ]);
    const result = parsePrListJson(raw);
    expect(result.length).toBe(1);
    expect(result[0].number).toBe(42);
    expect(result[0].headRefName).toBe('feature/foo');
  });

  it('returns empty array on empty JSON array', () => {
    expect(parsePrListJson('[]')).toEqual([]);
  });

  it('throws on invalid JSON', () => {
    expect(() => parsePrListJson('not json')).toThrow();
  });
});
