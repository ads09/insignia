import { describe, expect, it } from 'vitest';
import { pageRange } from './page-range';

describe('pageRange', () => {
  it('shows every page when there are few', () => {
    expect(pageRange(1, 1)).toEqual([1]);
    expect(pageRange(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it('replaces long runs with gaps', () => {
    expect(pageRange(5, 10)).toEqual([1, 'gap', 4, 5, 6, 'gap', 10]);
    expect(pageRange(1, 24)).toEqual([1, 2, 'gap', 24]);
    expect(pageRange(24, 24)).toEqual([1, 'gap', 23, 24]);
  });

  it('fills a gap of a single page with that page', () => {
    expect(pageRange(4, 10)).toEqual([1, 2, 3, 4, 5, 'gap', 10]);
  });
});
