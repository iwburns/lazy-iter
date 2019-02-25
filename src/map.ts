import { ILazyIter, makeArray } from "./iter";
import TakeIter from "./take";
import FilterIter from "./filter";

export default class MapIter<T, U> implements ILazyIter<U> {
  _iter: ILazyIter<T>;
  func: (val: T) => U;

  constructor(iter: ILazyIter<T>, func: (val: T) => U) {
    this._iter = iter;
    this.func = func;
  }

  next(): IteratorResult<U> {
    const nextItem = this._iter.next();

    if (nextItem.done) {
      // this is a workaround due to bad TS type defs on IteratorResult
      // see this issue for info: https://github.com/Microsoft/TypeScript/issues/11375
      const result = { done: true, value: undefined };
      return result as unknown as IteratorResult<U>;
    }

    return {
      done: false,
      value: this.func(nextItem.value),
    };
  }

  take(count: number): ILazyIter<U> {
    return new TakeIter(this, count);
  }

  filter(predicate: (val: U) => boolean): ILazyIter<U> {
    return new FilterIter(this, predicate);
  }

  map<V>(func: (val: U) => V): ILazyIter<V> {
    return new MapIter(this, func);
  }

  toArray(): Array<U> {
    return makeArray(this);
  }

  reduce<A>(reducer: (acc: A, val: U) => A, initialValue: A): A {
    return makeArray(this).reduce(reducer, initialValue);
  }
}
