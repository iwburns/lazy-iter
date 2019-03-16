import { LazyIter } from '../src/index';
import util from './util';

const src = [1, 2, 3, 4, 5];

describe('BaseIter', () => {
  describe('next', () => {
    it('should iterate over an array', () => {
      const iter = LazyIter.from(src);
      util.expectToIterateOverValues(iter, src);
    });
  });

  describe('nth', () => {
    it('should return the nth item in the iterator', () => {
      const iter = LazyIter.from(src);

      expect(iter.nth(2).value).toEqual(3);

      util.expectToIterateOverValues(iter, [4, 5]);
    });
  });

  describe('toArray', () => {
    it('should consume the iterator and return an array of values', () => {
      const iter = LazyIter.from(src);
      const arr = iter.toArray();

      expect(arr).toEqual(src);
      expect(iter.next().done).toBeTruthy();
    });

    it('should only return items that have not been iterated over yet', () => {
      const iter = LazyIter.from(src);

      expect(iter.next().value).toBe(1);

      const arr = iter.toArray();

      expect(arr).toEqual(src.slice(1));
      expect(iter.next().done).toBeTruthy();
    });
  });

  describe('forEach', () => {
    it('should consume the iterator and call the given function on each item', () => {
      const iter = LazyIter.from(src);
      const expectedIndexes = src.map((val, i) => i);

      const values: Array<number> = [];
      const indexes: Array<number> = [];

      iter.forEach((val, index) => {
        values.push(val);
        indexes.push(index);
      });

      expect(values).toEqual(src);
      expect(indexes).toEqual(expectedIndexes);
    });
  });

  describe('reduce', () => {
    it('should consume the iterator and return the "reduced" result', () => {
      const iter = LazyIter.from(src);

      const reducer = (acc: number, curr: number) => acc + curr;

      const reduced = iter.reduce(reducer, 0);
      const expected = src.reduce(reducer, 0);

      expect(reduced).toBe(expected);
      expect(iter.next().done).toBeTruthy();
    });
  });

  describe('skip', () => {
    it('should skip x number of elements and continue iterating', () => {
      const iter = LazyIter.from(src).skip(2);
      util.expectToIterateOverValues(iter, [3, 4, 5]);
    });
  });

  describe('take', () => {
    it('should iterate over x number of elements and stop', () => {
      const iter = LazyIter.from(src).take(3);
      util.expectToIterateOverValues(iter, [1, 2, 3]);
    });
  });

  describe('filter', () => {
    it('should filter out items that do not pass the predicate test', () => {
      const iter = LazyIter.from(src).filter(x => x % 2 === 0);
      util.expectToIterateOverValues(iter, [2, 4]);
    });
  });

  describe('map', () => {
    it('should map each item with the mapping function and iterate over the new values', () => {
      const iter = LazyIter.from(src).map(x => x * 10);
      util.expectToIterateOverValues(iter, [10, 20, 30, 40, 50]);
    });
  });

  describe('zip', () => {
    it('should iterate over two different iterables at the same time', () => {
      const iter = LazyIter.from(src).zip(['a', 'b', 'c', 'd', 'e']);
      util.expectToIterateOverValues(iter, [
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
        [4, 'd'],
        [5, 'e'],
      ]);
    });

    it('should stop iterating as soon as one iterable is done (left first)', () => {
      const iter = LazyIter.from(src).zip(['a', 'b', 'c', 'd', 'e', 'f']);
      util.expectToIterateOverValues(iter, [
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
        [4, 'd'],
        [5, 'e'],
      ]);
    });

    it('should stop iterating as soon as one iterable is done (right first)', () => {
      const iter = LazyIter.from(src).zip(['a', 'b', 'c', 'd']);
      util.expectToIterateOverValues(iter, [
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
        [4, 'd'],
      ]);
    });
  });

  describe('chain', () => {
    it('should iterate over two different iterables one after the other', () => {
      const other = ['a', 'b', 'c'];
      const iter = LazyIter.from(src).chain(other);
      util.expectToIterateOverValues(iter, [...src, ...other]);
    });
  });

  describe('enumerate', () => {
    it('should iterate over an iterable while providing an index', () => {
      const iter = LazyIter.from(src).enumerate();
      util.expectToIterateOverValues(iter, [
        [1, 0],
        [2, 1],
        [3, 2],
        [4, 3],
        [5, 4],
      ]);
    });
  });
});
