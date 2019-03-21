import { LazyIter } from '../src/index';
import util from './util';

const src = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const other = src.map(val => val * 10);

function getIter() {
  return {
    iter: LazyIter.from(src).zip(other),
    values: src.map((val, i) => [val, other[i]]),
  };
}

describe('ZipIter', () => {
  util.testNext(getIter);
  util.testNth(getIter);
  util.testToArray(getIter);
  util.testForEach(getIter);

  describe('reduce', () => {
    it('should consume the iterator and return the "reduced" result', () => {
      const { iter, values } = getIter();

      const reducer = (acc: number, [left, right]: Array<number>) => acc + left + right;

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
        const predicate = ([left, right]: Array<number>, i: number) => left > right;

        const result = iter.every(predicate);
        const expected = values.every(predicate);

        expect(result).toBe(expected);
      }
      {
        const { iter, values } = getIter();
        const predicate = ([left, right]: Array<number>, i: number) => left < right;

        const result = iter.every(predicate);
        const expected = values.every(predicate);

        expect(result).toBe(expected);
      }
    });
  });

  util.testSkip(getIter);
  util.testTake(getIter);

  describe('filter', () => {
    it('should filter out items that do not pass the predicate test', () => {
      const { iter, values } = getIter();
      const pred = ([left]: Array<number>) => left % 2 === 0;
      util.expectToIterateOverValues(iter.filter(pred), values.filter(pred));
    });
  });

  describe('map', () => {
    it('should map each item with the mapping function and iterate over the new values', () => {
      const { iter, values } = getIter();
      const mapper = ([left, right]: Array<number>) => left + right;
      util.expectToIterateOverValues(iter.map(mapper), values.map(mapper));
    });
  });

  util.testZip(getIter);
  util.testChain(getIter);
  util.testEnumerate(getIter);
});
