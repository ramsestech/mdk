import { describe, it, expect } from 'vitest';
import { renderPrBody, replaceSiblingPlaceholder } from '../../commands/feature-submit';

describe('renderPrBody', () => {
  it('marks api type checkbox', () => {
    const body = renderPrBody({ featureId: 'rs-foo', type: 'api' });
    expect(body).toContain('[x] API');
    expect(body).toContain('[ ] Component');
  });

  it('embeds the feature id', () => {
    const body = renderPrBody({ featureId: 'rs-foo', type: 'api' });
    expect(body).toContain('rs-foo');
  });
});

describe('replaceSiblingPlaceholder', () => {
  it('replaces TBD with the sibling URL', () => {
    const before = `## Sibling PR\nTBD\n## Outline\n...`;
    const after = replaceSiblingPlaceholder(before, 'https://github.com/r/p/pull/42');
    expect(after).toContain('https://github.com/r/p/pull/42');
    expect(after).not.toMatch(/\bTBD\b/);
  });
});
