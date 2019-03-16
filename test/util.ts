import { LazyIter } from "../src";

export function expectToIterateOverValues<T, U>(iter: LazyIter<T, U>, values: Array<U>) {
  values.forEach((value: U) => {
    expect(iter.next().value).toEqual(value);
  });
  expect(iter.next().done).toBeTruthy();
}

export default {
  expectToIterateOverValues,
};
