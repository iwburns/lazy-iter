const Benchmark = require('benchmark');
const { LazyIter } = require('../dist/index');

const arrayLen = 100;
const sourceArray = Array.from({ length: arrayLen }).map((_, i) => i);

const mapper = x => x * 2;

function singleArrayMap() {
  return sourceArray.map(mapper);
}

function singleLazyMap() {
  return LazyIter.from(sourceArray).map(mapper).toArray();
}

const singleMapSuite = new Benchmark.Suite;
singleMapSuite
  .add('single Array.prototype.map', singleArrayMap)
  .add('single LazyIter.map', singleLazyMap)
  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  // run async
  .run({
    'async': false
  });

function doubleArrayMap() {
  return sourceArray
    .map(mapper)
    .map(mapper);
}

function doubleLazyMap() {
  return LazyIter
    .from(sourceArray)
    .map(mapper)
    .map(mapper)
    .toArray();
}

const doubleMapSuite = new Benchmark.Suite;
doubleMapSuite
  .add('double Array.prototype.map', doubleArrayMap)
  .add('double LazyIter.map', doubleLazyMap)
  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  // run async
  .run({
    'async': false
  });


function tripleArrayMap() {
  return sourceArray
    .map(mapper)
    .map(mapper)
    .map(mapper);
}

function tripleLazyMap() {
  return LazyIter
    .from(sourceArray)
    .map(mapper)
    .map(mapper)
    .map(mapper)
    .toArray();
}

const tripleMapSuite = new Benchmark.Suite;
tripleMapSuite
  .add('triple Array.prototype.map', tripleArrayMap)
  .add('triple LazyIter.map', tripleLazyMap)
  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  // run async
  .run({
    'async': false
  });
