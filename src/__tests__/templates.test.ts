import { describe, it, expect } from 'vitest';
import { interpolate } from '../core/templates';

describe('interpolate', () => {
  it('replaces {{name}} placeholders', () => {
    const out = interpolate('Hello {{name}}!', { name: 'world' });
    expect(out).toBe('Hello world!');
  });

  it('replaces multiple occurrences', () => {
    const out = interpolate('{{a}}{{b}}{{a}}', { a: '1', b: '2' });
    expect(out).toBe('121');
  });

  it('leaves unknown placeholders alone', () => {
    const out = interpolate('{{known}} {{unknown}}', { known: 'X' });
    expect(out).toBe('X {{unknown}}');
  });
});
