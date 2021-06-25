import {IncludeExcludeFilter} from './filter';
import test from 'ava';

test('filters without config', t => {
  const filter = new IncludeExcludeFilter({});

  t.deepEqual(filter.filter(['a', 'b', 'c']), ['a', 'b', 'c']);
});

test('filters using includes string', t => {
  const filter = new IncludeExcludeFilter({
    includes: ['[ab]'],
  });

  t.deepEqual(filter.filter(['a', 'b', 'c']), ['a', 'b']);
});

test('filters using includes regex', t => {
  const filter = new IncludeExcludeFilter({
    includes: [/[ac]/],
  });

  t.deepEqual(filter.filter(['a', 'b', 'c']), ['a', 'c']);
});

test('filters using excludes string', t => {
  const filter = new IncludeExcludeFilter({
    excludes: ['[ab]'],
  });

  t.deepEqual(filter.filter(['a', 'b', 'c']), ['c']);
});

test('filters using excludes regex', t => {
  const filter = new IncludeExcludeFilter({
    excludes: [/[ac]/],
  });

  t.deepEqual(filter.filter(['a', 'b', 'c']), ['b']);
});

test('filters using includes and excludes string', t => {
  const filter = new IncludeExcludeFilter({
    includes: ['[ab]'],
    excludes: ['[a]'],
  });

  t.deepEqual(filter.filter(['a', 'b', 'c']), ['b']);
});

test('filters using includes and excludes regex', t => {
  const filter = new IncludeExcludeFilter({
    includes: [/[ac]/],
    excludes: [/[c]/],
  });

  t.deepEqual(filter.filter(['a', 'b', 'c']), ['a']);
});
