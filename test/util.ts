import { LazyIter } from "../src";

function expectToIterateOverValues<T, U>(iter: LazyIter<T, U>, values: Array<U>) {
  values.forEach((value: U) => {
    expect(iter.next().value).toEqual(value);
  });
  expect(iter.next().done).toBeTruthy();
}

function getPairs<T, U>(arr1: Array<T>, arr2: Array<U>): Array<[T, U]> {
  const output: Array<[T, U]> = [];

  if (arr1.length > arr2.length) {
    arr2.forEach((val, i) => {
      output.push([arr1[i], val]);
    });
  } else {
    arr1.forEach((val, i) => {
      output.push([val, arr2[i]]);
    });
  }

  return output;
}

function getAlphaArray(length: number) {
  return 'abcdefghijklmnopqrstuvwxyz'.split('').filter((_, i) => i < length);
}

function testNext<T, U>(getIter: () => { iter: LazyIter<T, U>, values: Array<U> }) {
  describe('next', () => {
    it('should iterate over an array', () => {
      const { iter, values } = getIter();
      expectToIterateOverValues(iter, values);
    });
  });
}

function testNth<T, U>(getIter: () => { iter: LazyIter<T, U>, values: Array<U> }) {
  describe('nth', () => {
    it('should return the nth item in the iterator', () => {
      const { iter, values } =  getIter();
      const n = 2;
      const nth = iter.nth(n).value;
      const expected = values[n];

      expect(nth).toEqual(expected);
      expectToIterateOverValues(iter, values.slice(n + 1));
    });
  });
}

function testToArray<T, U>(getIter: () => { iter: LazyIter<T, U>, values: Array<U> }) {
  describe('toArray', () => {
    it('should consume the iterator and return an array of values', () => {
      const { iter, values } = getIter();
      const arr = iter.toArray();

      expect(arr).toEqual(values);
      expect(iter.next().done).toBeTruthy();
    });

    it('should only return items that have not been iterated over yet', () => {
      const { iter, values } = getIter();

      const first = iter.next().value;
      const expected = values[0];
      expect(first).toEqual(expected);

      const arr = iter.toArray();
      expect(arr).toEqual(values.slice(1));
      expect(iter.next().done).toBeTruthy();
    });
  });
}

function testForEach<T, U>(getIter: () => { iter: LazyIter<T, U>, values: Array<U> }) {
  describe('forEach', () => {
    it('should consume the iterator and call the given function on each item', () => {
      const { iter, values } = getIter();
      const expectedIndexes = values.map((val, i) => i);

      const vals: Array<U> = [];
      const indexes: Array<number> = [];

      iter.forEach((val, index) => {
        vals.push(val);
        indexes.push(index);
      });

      expect(vals).toEqual(values);
      expect(indexes).toEqual(expectedIndexes);
    });
  });
}

function testReduce(getIter: () => { iter: LazyIter<number, number>, values: Array<number> }) {
  describe('reduce', () => {
    it('should consume the iterator and return the "reduced" result', () => {
      const { iter, values } = getIter();

      const reducer = (acc: number, curr: number) => acc + curr;

      const reduced = iter.reduce(reducer, 0);
      const expected = values.reduce(reducer, 0);

      expect(reduced).toBe(expected);
      expect(iter.next().done).toBeTruthy();
    });
  });
}

function testSkip<T, U>(getIter: () => { iter: LazyIter<T, U>, values: Array<U> }) {
  describe('skip', () => {
    it('should skip x number of elements and continue iterating', () => {
      const { iter, values } = getIter();
      expectToIterateOverValues(iter.skip(1), values.slice(1));
    });
  });
}

function testTake<T, U>(getIter: () => { iter: LazyIter<T, U>, values: Array<U> }) {
  describe('take', () => {
    it('should iterate over x number of elements and stop', () => {
      const { iter, values } = getIter();
      expectToIterateOverValues(iter.take(2), values.slice(0, 2));
    });
  });
}

function testFilter(getIter: () => { iter: LazyIter<number, number>, values: Array<number> }) {
  describe('filter', () => {
    it('should filter out items that do not pass the predicate test', () => {
      const { iter, values } = getIter();
      const pred = (x: number) => x % 2 === 0;
      expectToIterateOverValues(iter.filter(pred), values.filter(pred));
    });
  });
}

function testMap(getIter: () => { iter: LazyIter<number, number>, values: Array<number> }) {
  describe('map', () => {
    it('should map each item with the mapping function and iterate over the new values', () => {
      const { iter, values } = getIter();
      const mapper = (x: number) => x * 10;
      expectToIterateOverValues(iter.map(mapper), values.map(mapper));
    });
  });
}

function testZip<T, U>(getIter: () => { iter: LazyIter<T, U>, values: Array<U> }) {
  describe('zip', () => {
    it('should iterate over two different iterables at the same time', () => {
      const { iter, values } = getIter();
      const other = getAlphaArray(values.length);
      expectToIterateOverValues(iter.zip(other), getPairs(values, other));
    });

    it('should stop iterating as soon as one iterable is done (left first)', () => {
      const { iter, values } = getIter();
      const other = getAlphaArray(values.length + 1);
      expectToIterateOverValues(iter.zip(other), getPairs(values, other));
    });

    it('should stop iterating as soon as one iterable is done (right first)', () => {
      const { iter, values } = getIter();
      const other = getAlphaArray(values.length - 1);
      expectToIterateOverValues(iter.zip(other), getPairs(values, other));
    });

    it('should accept a LazyIter as an argument', () => {
      const { iter, values } = getIter();
      const other = getAlphaArray(values.length);
      expectToIterateOverValues(iter.zip(LazyIter.from(other)), getPairs(values, other));
    });
  });
}

function testChain<T, U>(getIter: () => { iter: LazyIter<T, U>, values: Array<U> }) {
  describe('chain', () => {
    it('should iterate over two different iterables one after the other', () => {
      const { iter, values } = getIter();
      const other = getAlphaArray(values.length);
      expectToIterateOverValues(iter.chain(other), [...values, ...other]);
    });

    it('should accept a LazyIter as an argument', () => {
      const { iter, values } = getIter();
      const other = getAlphaArray(values.length);
      expectToIterateOverValues(iter.chain(LazyIter.from(other)), [...values, ...other]);
    });
  });
}

function testEnumerate<T, U>(getIter: () => { iter: LazyIter<T, U>, values: Array<U> }) {
  describe('enumerate', () => {
    it('should iterate over an iterable while providing an index', () => {
      const { iter, values } = getIter();
      expectToIterateOverValues(iter.enumerate(), values.map((val, i) => [val, i]));
    });
  });
}

export default {
  expectToIterateOverValues,
  getPairs,
  testNext,
  testNth,
  testToArray,
  testForEach,
  testReduce,
  testSkip,
  testTake,
  testFilter,
  testMap,
  testZip,
  testChain,
  testEnumerate,
};
