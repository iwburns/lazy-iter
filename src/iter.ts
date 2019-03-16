// todo: can we split up this file at all?  need to avoid circular dependencies when doing so

export default abstract class LazyIter<Inner, Output> {
  // return the next item in the list if it exists (no lazyness here)
  abstract next(): IteratorResult<Output>;

  static from<Type>(iterable: Iterable<Type>): LazyIter<Type, Type> {
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

  // consume the rest of the iterator and call `func` on each item
  forEach(func: (val: Output, index: number) => void) {
    let i = -1;

    while (true) {
      const nextItem = this.next();
      i += 1;

      if (nextItem.done) {
        break;
      }

      func(nextItem.value, i);
    }
  }

  // reduce into a single value, not lazy
  reduce<Acc>(reducer: (acc: Acc, val: Output) => Acc, initialValue: Acc): Acc {
    let final = initialValue;

    while (true) {
      const nextItem = this.next();

      if (nextItem.done) {
        return final;
      }

      final = reducer(final, nextItem.value);
    }
  }

  // return the nth item in the iterator
  nth(n: number): IteratorResult<Output> {
    while (n > 0) {
      this.next();
      n -= 1;
    }
    return this.next();
  }

  // return an iterator starting after "count" items
  skip(count: number): LazyIter<Inner, Output> {
    return new SkipIter(this, count);
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

  // iterate over two iterators at the same time, lazy
  zip<InnerR, OutputR>(iter: LazyIter<InnerR, OutputR> | Iterable<OutputR>): LazyIter<[Inner, InnerR], [Output, OutputR]> | LazyIter<[Inner, OutputR], [Output, OutputR]> {
    if (iter instanceof LazyIter) {
      return new ZipIter(this, iter);
    }

    return new ZipIter(this, LazyIter.from(iter));
  }

  // iterate over two iterators one after the other
  chain<InnerS, OutputS>(iter: LazyIter<InnerS, OutputS> | Iterable<OutputS>): LazyIter<Inner, Output | OutputS> {
    if (iter instanceof LazyIter) {
      return new ChainIter(this, iter);
    }

    return new ChainIter(this, LazyIter.from(iter));
  }

  enumerate(): LazyIter<Inner, [Output, number]> {
    return new EnumerateIter(this);
  }
}

class BaseIter<T> extends LazyIter<T, T> {
  iter: Iterator<T>;

  constructor(iterable: Iterable<T>) {
    super();
    this.iter = iterable[Symbol.iterator]();
  }

  next(): IteratorResult<T> {
    return this.iter.next();
  }
}

class SkipIter<T, U> extends LazyIter<T, U> {
  iter: LazyIter<T, U>;
  count: number;

  constructor(iter: LazyIter<T, U>, count: number) {
    super();
    this.iter = iter;
    this.count = count;
  }

  next(): IteratorResult<U> {
    if (this.count === 0) {
      return this.iter.next();
    }

    const skip = this.count;
    this.count = 0;

    return this.iter.nth(skip);
  }
}

class TakeIter<T, U> extends LazyIter<T, U> {
  iter: LazyIter<T, U>;
  size: number;
  index: number;

  constructor(iter: LazyIter<T, U>, size: number) {
    super();
    this.iter = iter;
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

    return this.iter.next();
  }
}

class FilterIter<T, U> extends LazyIter<T, U> {
  iter: LazyIter<T, U>;
  predicate: (val: U) => boolean;

  constructor(iter: LazyIter<T, U>, predicate: (val: U) => boolean) {
    super();
    this.iter = iter;
    this.predicate = predicate;
  }

  next(): IteratorResult<U> {
    while (true) {
      const nextItem = this.iter.next();

      if (nextItem.done) {
        return nextItem;
      }

      if (this.predicate(nextItem.value)) {
        return nextItem;
      }
    }
  }
}

class MapIter<T, U, M> extends LazyIter<T, M> {
  iter: LazyIter<T, U>;
  func: (val: U) => M;

  constructor(iter: LazyIter<T, U>, func: (val: U) => M) {
    super();
    this.iter = iter;
    this.func = func;
  }

  next(): IteratorResult<M> {
    const nextItem = this.iter.next();

    return {
      done: nextItem.done,
      value: this.func(nextItem.value),
    };
  }
}

class ZipIter<InnerL, OutputL, InnerR, OutputR> extends LazyIter<[InnerL, InnerR], [OutputL, OutputR]> {
  left: LazyIter<InnerL, OutputL>;
  right: LazyIter<InnerR, OutputR>;

  constructor(left: LazyIter<InnerL, OutputL>, right: LazyIter<InnerR, OutputR>) {
    super();
    this.left = left;
    this.right = right;
  }

  next(): IteratorResult<[OutputL, OutputR]> {
    const lNext = this.left.next();

    if (lNext.done) {
      // this is a workaround due to bad TS type defs on IteratorResult
      // see this issue for info: https://github.com/Microsoft/TypeScript/issues/11375
      const result = { done: true, value: undefined };
      return result as unknown as IteratorResult<[OutputL, OutputR]>;
    }

    const rNext = this.right.next();

    if (rNext.done) {
      // this is a workaround due to bad TS type defs on IteratorResult
      // see this issue for info: https://github.com/Microsoft/TypeScript/issues/11375
      const result = { done: true, value: undefined };
      return result as unknown as IteratorResult<[OutputL, OutputR]>;
    }

    return {
      done: false,
      value: [lNext.value, rNext.value],
    }
  }
}

class ChainIter<InnerF, OutputF, InnerS, OutputS> extends LazyIter<InnerF, OutputF | OutputS> {
  first: LazyIter<InnerF, OutputF>;
  second: LazyIter<InnerS, OutputS>;
  onFirst: boolean;

  constructor(first: LazyIter<InnerF, OutputF>, second: LazyIter<InnerS, OutputS>) {
    super();
    this.first = first;
    this.second = second;
    this.onFirst = true;
  }

  next(): IteratorResult<OutputF | OutputS> {
    if (this.onFirst) {
      const nextItem = this.first.next();

      if (nextItem.done) {
        this.onFirst = false;
      } else {
        return nextItem;
      }
    }

    return this.second.next();
  }
}

class EnumerateIter<T, U> extends LazyIter<T, [U, number]> {
  iter: LazyIter<T, U>;
  index: number;

  constructor(iter: LazyIter<T, U>) {
    super();
    this.iter = iter;
    this.index = -1;
  }

  next(): IteratorResult<[U, number]> {
    const nextItem = this.iter.next();

    if (nextItem.done) {
      // this is a workaround due to bad TS type defs on IteratorResult
      // see this issue for info: https://github.com/Microsoft/TypeScript/issues/11375
      const result = { done: true, value: undefined };
      return result as unknown as IteratorResult<[U, number]>;
    }

    this.index += 1;

    return {
      done: false,
      value: [nextItem.value, this.index],
    }
  }
}
