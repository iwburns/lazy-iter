// todo: can we split up this file at all?  need to avoid circular dependencies when doing so

export default abstract class LazyIter<Inner, Output> {
  // return the next item in the list if it exists (no lazyness here)
  abstract next(): IteratorResult<Output>;

  // todo: can we allow other types here?
  static from<Type>(iterable: Array<Type>): LazyIter<Type, Type> {
    return new BaseIter(iterable);
  }

  // consume rest of iterator and collect into an array
  toArray(): Array<Output> {
    const arr = [];

    while (true) {
      const nextItem = this.next();

      if (nextItem.done) {
        return arr;
      }

      arr.push(nextItem.value);
    }
  }

  // reduce into a single value, not lazy
  reduce<Acc>(reducer: (acc: Acc, val: Output) => Acc, initialValue: Acc): Acc {
    return this.toArray().reduce(reducer, initialValue);
  }

  // return iterator ending after "count" items
  take(count: number): LazyIter<Inner, Output> {
    return new TakeIter(this, count);
  }

  // filter by a predicate, lazy
  filter(predicate: (val: Output) => boolean): LazyIter<Inner, Output> {
    return new FilterIter(this, predicate);
  }

  // map one value to another, lazy
  map<Mapped>(func: (val: Output) => Mapped): LazyIter<Inner, Mapped> {
    return new MapIter(this, func);
  }
}

export class BaseIter<T> extends LazyIter<T, T> {
  _iter: Iterator<T>;

  constructor(iterable: any) {
    super();
    if (typeof iterable[Symbol.iterator] !== 'function') {
      throw new Error('`iterable[Symbol.iterator]` must be a function');
    }
    this._iter = iterable[Symbol.iterator]();
  }

  next(): IteratorResult<T> {
    return this._iter.next();
  }
}

export class TakeIter<T, U> extends LazyIter<T, U> {
  _iter: LazyIter<T, U>;
  size: number;
  index: number;

  constructor(iter: LazyIter<T, U>, size: number) {
    super();
    this._iter = iter;
    this.size = size;
    this.index = 0;
  }

  next(): IteratorResult<U> {
    if (this.index >= this.size) {
      // this is a workaround due to bad TS type defs on IteratorResult
      // see this issue for info: https://github.com/Microsoft/TypeScript/issues/11375
      const result = { done: true, value: undefined };
      return result as unknown as IteratorResult<U>;
    }

    this.index += 1;

    return this._iter.next();
  }
}

export class FilterIter<T, U> extends LazyIter<T, U> {
  _iter: LazyIter<T, U>;
  predicate: (val: U) => boolean;

  constructor(iter: LazyIter<T, U>, predicate: (val: U) => boolean) {
    super();
    this._iter = iter;
    this.predicate = predicate;
  }

  next(): IteratorResult<U> {
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
}

export class MapIter<T, U, M> extends LazyIter<T, M> {
  _iter: LazyIter<T, U>;
  func: (val: U) => M;

  constructor(iter: LazyIter<T, U>, func: (val: U) => M) {
    super();
    this._iter = iter;
    this.func = func;
  }

  next(): IteratorResult<M> {
    const nextItem = this._iter.next();

    if (nextItem.done) {
      // this is a workaround due to bad TS type defs on IteratorResult
      // see this issue for info: https://github.com/Microsoft/TypeScript/issues/11375
      const result = { done: true, value: undefined };
      return result as unknown as IteratorResult<M>;
    }

    return {
      done: false,
      value: this.func(nextItem.value),
    };
  }
}
