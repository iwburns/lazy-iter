import { LazyIter } from '../src/index';
import util from './util';

const src = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function getIter() {
  return {
    iter: LazyIter.from(src).take(5),
    values: src.slice(0, 5),
  };
}

describe('SkipIter', () => {
  util.testNext(getIter);
  util.testNth(getIter);
  util.testToArray(getIter);
  util.testForEach(getIter);
  util.testReduce(getIter);
  util.testSkip(getIter);
  util.testTake(getIter);
  util.testFilter(getIter);
  util.testMap(getIter);
  util.testZip(getIter);
  util.testChain(getIter);
  util.testEnumerate(getIter);
});
