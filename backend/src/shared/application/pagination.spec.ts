import { toPage } from './pagination.js';

describe('toPage', () => {
  it('computes the number of pages', () => {
    expect(toPage(['a'], 21, { page: 3, limit: 10 })).toEqual({
      data: ['a'],
      meta: { page: 3, limit: 10, total: 21, totalPages: 3 },
    });
  });

  it('reports zero pages for an empty result', () => {
    expect(toPage([], 0, { page: 1, limit: 10 }).meta.totalPages).toBe(0);
  });
});
