import { LazyIter } from '../src/index';

const src = [1, 2, 3, 4, 5];

describe('BaseIter', () => {
  describe('next', () => {
    it('should iterate over an array', () => {
      const iter = LazyIter.from(src);

      expect(iter.next().value).toBe(1);
      expect(iter.next().value).toBe(2);
      expect(iter.next().value).toBe(3);
      expect(iter.next().value).toBe(4);
      expect(iter.next().value).toBe(5);

      expect(iter.next().done).toBeTruthy();
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
});

describe('TakeIter', () => {
  it('should iterate over x number of items from an array', () => {
    const iter = LazyIter.from(src).take(4);

    expect(iter.next().value).toBe(1);
    expect(iter.next().value).toBe(2);
    expect(iter.next().value).toBe(3);
    expect(iter.next().value).toBe(4);

    expect(iter.next().done).toBeTruthy();
  });
});

describe('FilterIter', () => {
  it('should skip items that do not satisfy the predicate', () => {
    const iter = LazyIter.from(src).filter(x => x % 2 === 0);

    expect(iter.next().value).toBe(2);
    expect(iter.next().value).toBe(4);

    expect(iter.next().done).toBeTruthy();
  });
});

describe('MapIter', () => {
  it('should map each value to a new value with the given mapping', () => {
    const iter = LazyIter.from(src).map(x => x * 2);

    expect(iter.next().value).toBe(2);
    expect(iter.next().value).toBe(4);
    expect(iter.next().value).toBe(6);
    expect(iter.next().value).toBe(8);
    expect(iter.next().value).toBe(10);

    expect(iter.next().done).toBeTruthy();
  });
});

describe('ZipIter', () => {
  it('should iterate over two iterables at the same time', () => {
    const otherSrc = ['a', 'b', 'c', 'd', 'e'];

    const iter = LazyIter.from(src).zip(otherSrc);

    expect(iter.next().value).toEqual([1, 'a']);
    expect(iter.next().value).toEqual([2, 'b']);
    expect(iter.next().value).toEqual([3, 'c']);
    expect(iter.next().value).toEqual([4, 'd']);
    expect(iter.next().value).toEqual([5, 'e']);

    expect(iter.next().done).toBeTruthy();
  });

  it('stop when the first iterator stops (right)', () => {
    const otherSrc = ['a', 'b', 'c', 'd'];

    const iter = LazyIter.from(src).zip(otherSrc);

    expect(iter.next().value).toEqual([1, 'a']);
    expect(iter.next().value).toEqual([2, 'b']);
    expect(iter.next().value).toEqual([3, 'c']);
    expect(iter.next().value).toEqual([4, 'd']);

    expect(iter.next().done).toBeTruthy();
  });


  it('stop when the first iterator stops (left)', () => {
    const otherSrc = ['a', 'b', 'c', 'd', 'e', 'f'];

    const iter = LazyIter.from(src).zip(otherSrc);

    expect(iter.next().value).toEqual([1, 'a']);
    expect(iter.next().value).toEqual([2, 'b']);
    expect(iter.next().value).toEqual([3, 'c']);
    expect(iter.next().value).toEqual([4, 'd']);
    expect(iter.next().value).toEqual([5, 'e']);

    expect(iter.next().done).toBeTruthy();
  });
});
