import { LazyIter } from '../src/index';
import util from './util';

const src = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function getIter(take: number) {
  return {
    iter: LazyIter.from(src).take(take),
    values: src.slice(0, take),
  };
}

describe('SkipIter', () => {
  describe('next', () => {
    it('should iterate over an array', () => {
      const { iter, values } = getIter(5);
      util.expectToIterateOverValues(iter, values);
    });
  });

  describe('nth', () => {
    it('should return the nth item in the iterator', () => {
      const { iter, values } = getIter(5);

      expect(iter.nth(2).value).toEqual(3);

      // nth(n) is like skipping (n + 1)
      util.expectToIterateOverValues(iter, values.slice(3));
    });
  });

  describe('toArray', () => {
    it('should consume the iterator and return an array of values', () => {
      const { iter, values } = getIter(5);
      const arr = iter.toArray();

      expect(arr).toEqual(values);
      expect(iter.next().done).toBeTruthy();
    });

    it('should only return items that have not been iterated over yet', () => {
      const { iter, values } = getIter(5);

      expect(iter.next().value).toBe(1);

      const arr = iter.toArray();

      expect(arr).toEqual(values.slice(1));
      expect(iter.next().done).toBeTruthy();
    });
  });

  describe('forEach', () => {
    it('should consume the iterator and call the given function on each item', () => {
      const { iter, values } = getIter(5);
      const expectedIndexes = values.map((val, i) => i);

      const vals: Array<number> = [];
      const indexes: Array<number> = [];

      iter.forEach((val, index) => {
        vals.push(val);
        indexes.push(index);
      });

      expect(vals).toEqual(values);
      expect(indexes).toEqual(expectedIndexes);
    });
  });

  describe('reduce', () => {
    it('should consume the iterator and return the "reduced" result', () => {
      const { iter, values } = getIter(5);

      const reducer = (acc: number, curr: number) => acc + curr;

      const reduced = iter.reduce(reducer, 0);
      const expected = values.reduce(reducer, 0);

      expect(reduced).toBe(expected);
      expect(iter.next().done).toBeTruthy();
    });
  });

  describe('skip', () => {
    it('should skip x number of elements and continue iterating', () => {
      const { iter, values } = getIter(5);
      util.expectToIterateOverValues(iter.skip(2), values.slice(2));
    });
  });

  describe('take', () => {
    it('should iterate over x number of elements and stop', () => {
      const { iter, values } = getIter(5);
      util.expectToIterateOverValues(iter.take(3), values.slice(0, 3));
    });
  });

  describe('filter', () => {
    it('should filter out items that do not pass the predicate test', () => {
      const { iter, values } = getIter(5);
      const pred = (x: number) => x % 2 === 0;
      util.expectToIterateOverValues(iter.filter(pred), values.filter(pred));
    });
  });

  describe('map', () => {
    it('should map each item with the mapping function and iterate over the new values', () => {
      const { iter, values } = getIter(5);
      const mapper = (x: number) => x * 10;
      util.expectToIterateOverValues(iter.map(mapper), values.map(mapper));
    });
  });

  describe('zip', () => {
    it('should iterate over two different iterables at the same time', () => {
      const { iter, values } = getIter(5);
      const other = ['a', 'b', 'c', 'd', 'e'];
      util.expectToIterateOverValues(iter.zip(other), util.getPairs(values, other));
    });

    it('should stop iterating as soon as one iterable is done (left first)', () => {
      const { iter, values } = getIter(5);
      const other = ['a', 'b', 'c', 'd', 'e', 'f'];
      util.expectToIterateOverValues(iter.zip(other), util.getPairs(values, other));
    });

    it('should stop iterating as soon as one iterable is done (right first)', () => {
      const { iter, values } = getIter(5);
      const other = ['a', 'b', 'c', 'd'];
      util.expectToIterateOverValues(iter.zip(other), util.getPairs(values, other));
    });
  });

  describe('chain', () => {
    it('should iterate over two different iterables one after the other', () => {
      const other = ['a', 'b', 'c'];
      const { iter, values } = getIter(5);
      util.expectToIterateOverValues(iter.chain(other), [...values, ...other]);
    });
  });

  describe('enumerate', () => {
    it('should iterate over an iterable while providing an index', () => {
      const { iter, values } = getIter(5);
      util.expectToIterateOverValues(iter.enumerate(), values.map((val, i) => [val, i]));
    });
  });
});
