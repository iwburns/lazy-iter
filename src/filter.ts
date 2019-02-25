import { ILazyIter, makeArray } from "./iter";
import TakeIter from "./take";
import MapIter from "./map";

export default class FilterIter<T> implements ILazyIter<T> {
  _iter: ILazyIter<T>;
  predicate: (val: T) => boolean;

  constructor(iter: ILazyIter<T>, predicate: (val: T) => boolean) {
    this._iter = iter;
    this.predicate = predicate;
  }

  next(): IteratorResult<T> {
    while (true) {
      const nextItem = this._iter.next();

      if (nextItem.done) {
        return nextItem;
      }

      if (this.predicate(nextItem.value)) {
        return nextItem;
      }
    }
  }

  take(count: number): ILazyIter<T> {
    return new TakeIter(this, count);
  }

  filter(predicate: (val: T) => boolean): ILazyIter<T> {
    return new FilterIter(this, predicate);
  }

  toArray(): Array<T> {
    return makeArray(this);
  }

  map<U>(func: (val: T) => U): ILazyIter<U> {
    return new MapIter(this, func);
  }

  reduce<A>(reducer: (acc: A, val: T) => A, initialValue: A): A {
    return makeArray(this).reduce(reducer, initialValue);
  }
}
