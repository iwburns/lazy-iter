import { ILazyIter, makeArray } from './iter';
import FilterIter from './filter';
import MapIter from './map';

export default class TakeIter<T> implements ILazyIter<T> {
  _iter: ILazyIter<T>;
  size: number;
  count: number;

  constructor(iter: ILazyIter<T>, size: number) {
    this._iter = iter;
    this.size = size;
    this.count = 0
  }

  next(): IteratorResult<T> {
    if (this.count >= this.size) {
      // this is a workaround due to bad TS type defs on IteratorResult
      // see this issue for info: https://github.com/Microsoft/TypeScript/issues/11375
      const result = { done: true, value: undefined };
      return result as unknown as IteratorResult<T>;
    }

    this.count += 1;

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
