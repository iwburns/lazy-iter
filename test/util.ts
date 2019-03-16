import { LazyIter } from "../src";

export function expectToIterateOverValues<T, U>(iter: LazyIter<T, U>, values: Array<U>) {
  values.forEach((value: U) => {
    expect(iter.next().value).toEqual(value);
  });
  expect(iter.next().done).toBeTruthy();
}

export function getPairs<T, U>(arr1: Array<T>, arr2: Array<U>): Array<[T, U]> {
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

export default {
  expectToIterateOverValues,
  getPairs,
};
