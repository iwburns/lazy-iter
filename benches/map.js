const Benchmark = require('benchmark');
const { LazyIter } = require('../dist/index');

function onCycle(event) {
  console.log(String(event.target));
}

function onError(err) {
  console.error(err);
}

function onComplete() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
}

function singleSetup() {
  global.source = getSourceData();
  global.expected = source.map(mapper).reduce(reducer, 0);
  global.result = 0;
}

function doubleSetup() {
  global.source = getSourceData();
  global.expected = source.map(mapper).map(mapper).reduce(reducer, 0);
  global.result = 0;
}

function tripleSetup() {
  global.source = getSourceData();
  global.expected = source.map(mapper).map(mapper).map(mapper).reduce(reducer, 0);
  global.result = 0;
}

function quadSetup() {
  global.source = getSourceData();
  global.expected = source.map(mapper).map(mapper).map(mapper).map(mapper).reduce(reducer, 0);
  global.result = 0;
}

function teardown() {
  if (!resultMatchesExpected(result, expected)) {
    console.error('Invalid Results:');
    console.error('found:', result);
    console.error('expected:', expected);
  }
}

/**
 * In these tests, we have to make sure `LazyIter` actually does something, so we _must_ call `toArray` or
 * `reduce` or some other similar "non-lazy" function.
 *
 * To make things more "fair", I've chosen `reduce` here because it's something both groups of these tests can
 * do without causing too much overhead for either one.  This way, the "LazyMap" items are paying the overhead of
 * creating the `LazyIter` instance, but nothing else.
 *
 * I think this is a fair comparison because it's probably not smart to use `LazyIter` if you're just going to convert
 * back to an array at the end of your operations (especially if your arrays are very big). It would probably make more
 * sense to just stay in Array.prototype land in those cases.
 */

function singleArrayMap() {
  global.result = source.map(mapper).reduce(reducer, 0);
}

function singleLazyMap() {
  global.result = LazyIter.from(source).map(mapper).reduce(reducer, 0);
}

function doubleArrayMap() {
  global.result = source
    .map(mapper)
    .map(mapper)
    .reduce(reducer, 0);
}

function doubleLazyMap() {
  global.result = LazyIter.from(source)
    .map(mapper)
    .map(mapper)
    .reduce(reducer, 0);
}

function tripleArrayMap() {
  global.result = source
    .map(mapper)
    .map(mapper)
    .map(mapper)
    .reduce(reducer, 0);
}

function tripleLazyMap() {
  global.result = LazyIter.from(source)
    .map(mapper)
    .map(mapper)
    .map(mapper)
    .reduce(reducer, 0);
}

function quadArrayMap() {
  global.result = source
    .map(mapper)
    .map(mapper)
    .map(mapper)
    .map(mapper)
    .reduce(reducer, 0);
}

function quadLazyMap() {
  global.result = LazyIter.from(source)
    .map(mapper)
    .map(mapper)
    .map(mapper)
    .map(mapper)
    .reduce(reducer, 0);
}

function setupGlobals(arraySize) {
  global.require = require;
  global.LazyIter = LazyIter;

  global.mapper = x => x * x;
  global.reducer = (acc, curr) => acc + curr;

  global.resultMatchesExpected = (result, expected) => {
    return result === expected;
  };

  global.getSourceData = () => Array.from({ length: arraySize }).map(() => Math.random());

  global.source = [];
  global.expected = 0;
  global.result = 0;
}

function run(arraySize) {
  setupGlobals(arraySize);

  new Benchmark.Suite()
    .add(`single Array.prototype.map (${arraySize} elements)`, singleArrayMap, {
      'setup': singleSetup,
      'teardown': teardown,
    })
    .add(`single LazyIter.map (${arraySize} elements)`, singleLazyMap, {
      'setup': singleSetup,
      'teardown': teardown,
    })
    .on('cycle', onCycle)
    .on('error', onError)
    .on('complete', onComplete)
    .run();

  new Benchmark.Suite()
    .add(`double Array.prototype.map (${arraySize} elements)`, doubleArrayMap, {
      'setup': doubleSetup,
      'teardown': teardown,
    })
    .add(`double LazyIter.map (${arraySize} elements)`, doubleLazyMap, {
      'setup': doubleSetup,
      'teardown': teardown,
    })
    .on('cycle', onCycle)
    .on('error', onError)
    .on('complete', onComplete)
    .run();

  new Benchmark.Suite()
    .add(`triple Array.prototype.map (${arraySize} elements)`, tripleArrayMap, {
      'setup': tripleSetup,
      'teardown': teardown,
    })
    .add(`triple LazyIter.map (${arraySize} elements)`, tripleLazyMap, {
      'setup': tripleSetup,
      'teardown': teardown,
    })
    .on('cycle', onCycle)
    .on('error', onError)
    .on('complete', onComplete)
    .run();

  new Benchmark.Suite()
    .add(`quad Array.prototype.map (${arraySize} elements)`, quadArrayMap, {
      'setup': quadSetup,
      'teardown': teardown,
    })
    .add(`quad LazyIter.map (${arraySize} elements)`, quadLazyMap, {
      'setup': quadSetup,
      'teardown': teardown,
    })
    .on('cycle', onCycle)
    .on('error', onError)
    .on('complete', onComplete)
    .run();
}

function benchMap() {
  run(10);
  run(100);
  run(1000);
  // run(10000);
  // run(100000);
  // run(1000000);
}

module.exports = {
  benchMap,
};
