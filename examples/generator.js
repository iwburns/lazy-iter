const { LazyIter } = require('../dist/index');

function* counting() {
  let counter = 0;
  while (true) {
    counter += 1;
    yield counter;
  }
}

function run() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const countingNumbers = counting();
  const doubled = LazyIter.from(counting()).map(x => x * 2);

  LazyIter.from(countingNumbers)
    .zip(doubled)
    .zip(alphabet)
    .toArray()
    .forEach(([[count, double], letter]) => {
      console.log({ count, double, letter });
    });
}

module.exports = {
  run,
};
