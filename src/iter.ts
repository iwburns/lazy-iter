import TakeIter from './take';
import FilterIter from './filter';
import MapIter from './map';

export function makeArray<T>(iter: ILazyIter<T>): Array<T> {
  const arr = [];

  while (true) {
    const nextItem = iter.next();

    if (nextItem.done) {
      return arr;
    }

    arr.push(nextItem.value);
  }
}

export interface ILazyIter<T> {
  // return the next item in the list if it exists (no lazyness here)
  next(): IteratorResult<T>;

  // return iterator ending after "count" items
  take(count: number): ILazyIter<T>;

  // filter by a predicate, lazy
  filter(predicate: (val: T) => boolean): ILazyIter<T>;

  // map one value to another, lazy
  map<U>(func: (val: T) => U): ILazyIter<U>;

  // consume rest of iterator and collect into an array
  toArray(): Array<T>;

  // reduce into a single value, not lazy
  reduce<A>(reducer: (acc: A, val: T) => A, initialValue: A): A;
}

export default class LazyIter<T> implements ILazyIter<T> {
  _iter: Iterator<T>;

  private constructor(iterable: any) {
    if (typeof iterable[Symbol.iterator] !== 'function') {
      throw new Error('`iterable[Symbol.iterator]` must be a function');
    }
    this._iter = iterable[Symbol.iterator]();
  }

  // todo: can we allow other types here?
  static from<T>(iterable: Array<T>): LazyIter<T> {
    return new LazyIter(iterable);
  }

  next(): IteratorResult<T> {
    return this._iter.next();
  }

  take(count: number): ILazyIter<T> {
    return new TakeIter(this, count);
  }

  filter(predicate: (val: T) => boolean): ILazyIter<T> {
    return new FilterIter(this, predicate);
  }

  map<U>(func: (val: T) => U): ILazyIter<U> {
    return new MapIter(this, func);
  }

  toArray(): Array<T> {
    return makeArray(this);
  }

  reduce<A>(reducer: (acc: A, val: T) => A, initialValue: A): A {
    return makeArray(this).reduce(reducer, initialValue);
  }
}
