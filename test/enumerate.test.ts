import { LazyIter } from '../src/index';
import util from './util';

const src = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function getIter() {
  return {
    iter: LazyIter.from(src).enumerate(),
    values: src.map((val, i) => [val, i]),
  };
}

describe('MapIter', () => {
  util.testNext(getIter);
  util.testNth(getIter);
  util.testToArray(getIter);
  util.testForEach(getIter);

  describe('reduce', () => {
    it('should consume the iterator and return the "reduced" result', () => {
      const { iter, values } = getIter();

      const reducer = (acc: number, [val, index]: Array<number>) => acc + (val * index);

      const reduced = iter.reduce(reducer, 0);
      const expected = values.reduce(reducer, 0);

      expect(reduced).toBe(expected);
      expect(iter.next().done).toBeTruthy();
    });
  });

  describe('every', () => {
    it('should iterate and return true if all items return true for the predicate', () => {
      {
        const { iter, values } = getIter();
        const predicate = ([value, index]: Array<number>, i: number) => value > 11;

        const result = iter.every(predicate);
        const expected = values.every(predicate);

        expect(result).toBe(expected);
      }
      {
        const { iter, values } = getIter();
        const predicate = ([value, index]: Array<number>, i: number) => value < 11;

        const result = iter.every(predicate);
        const expected = values.every(predicate);

        expect(result).toBe(expected);
      }
    });
  });

  describe('some', () => {
    it('should iterate and return true if any item returns true for the predicate', () => {
      {
        const { iter, values } = getIter();
        const predicate = ([value, index]: Array<number>, i: number) => value > 11;

        const result = iter.some(predicate);
        const expected = values.some(predicate);

        expect(result).toBe(expected);
      }
      {
        const { iter, values } = getIter();
        const predicate = ([value, index]: Array<number>, i: number) => value < 11;

        const result = iter.some(predicate);
        const expected = values.some(predicate);

        expect(result).toBe(expected);
      }
    });
  });

  util.testSkip(getIter);
  util.testTake(getIter);

  describe('filter', () => {
    it('should filter out items that do not pass the predicate test', () => {
      const { iter, values } = getIter();
      const pred = ([val]: Array<number>) => val % 2 === 0;
      util.expectToIterateOverValues(iter.filter(pred), values.filter(pred));
    });
  });

  describe('map', () => {
    it('should map each item with the mapping function and iterate over the new values', () => {
      const { iter, values } = getIter();
      const mapper = ([val, index]: Array<number>) => val * index;
      util.expectToIterateOverValues(iter.map(mapper), values.map(mapper));
    });
  });

  util.testZip(getIter);
  util.testChain(getIter);
  util.testEnumerate(getIter);
});
