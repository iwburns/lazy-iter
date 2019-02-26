// export { default as LazyIter } from './iter';

import LazyIter from './iter';

const iter = LazyIter.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

const total = iter
  .filter(x => x % 2 === 0)
  .take(5)
  .map(x => x * 3)
  .reduce((sum, curr) => sum + curr, 0);

console.log(total);
