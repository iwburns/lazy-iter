const { LazyIter } = require('../dist/index');

const iter = LazyIter.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

const total = iter
  .filter(x => x % 2 === 0)
  .take(5)
  .map(x => x * 3)
  .reduce((sum, curr) => sum + curr, 0);

console.log(total);

function* evens() {
  let counter = 0;
  while (true) {
    counter += 1;
    yield counter * 2;
  }
}


const firstTen = LazyIter.from(evens()).take(10);

console.log(firstTen.toArray());
