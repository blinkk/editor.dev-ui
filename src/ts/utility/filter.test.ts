import {GlobFilter, IncludeExcludeFilter} from './filter';
import test from 'ava';

test('filters include/exclude without config', t => {
  const filter = new IncludeExcludeFilter({});

  t.deepEqual(filter.filter(['a', 'b', 'c']), ['a', 'b', 'c']);
});

test('filters include/exclude using includes string', t => {
  const filter = new IncludeExcludeFilter({
    includes: ['[ab]'],
  });

  t.deepEqual(filter.filter(['a', 'b', 'c']), ['a', 'b']);
});

test('filters include/exclude using includes regex', t => {
  const filter = new IncludeExcludeFilter({
    includes: [/[ac]/],
  });

  t.deepEqual(filter.filter(['a', 'b', 'c']), ['a', 'c']);
});

test('filters include/exclude using excludes string', t => {
  const filter = new IncludeExcludeFilter({
    excludes: ['[ab]'],
  });

  t.deepEqual(filter.filter(['a', 'b', 'c']), ['c']);
});

test('filters include/exclude using excludes regex', t => {
  const filter = new IncludeExcludeFilter({
    excludes: [/[ac]/],
  });

  t.deepEqual(filter.filter(['a', 'b', 'c']), ['b']);
});

test('filters include/exclude using includes and excludes string', t => {
  const filter = new IncludeExcludeFilter({
    includes: ['[ab]'],
    excludes: ['[a]'],
  });

  t.deepEqual(filter.filter(['a', 'b', 'c']), ['b']);
});

test('filters include/exclude using includes and excludes regex', t => {
  const filter = new IncludeExcludeFilter({
    includes: [/[ac]/],
    excludes: [/[c]/],
  });

  t.deepEqual(filter.filter(['a', 'b', 'c']), ['a']);
});

test('filters glob with simple glob patterns', t => {
  const filter = new GlobFilter({
    patterns: ['*.js'],
  });

  t.deepEqual(filter.filter(['a.md', 'b.js', 'c.txt']), ['b.js']);
});

test('filters glob with negated simple glob patterns', t => {
  const filter = new GlobFilter({
    negate: true,
    patterns: ['*.js'],
  });

  t.deepEqual(filter.filter(['a.md', 'b.js', 'c.txt']), ['a.md', 'c.txt']);
});
