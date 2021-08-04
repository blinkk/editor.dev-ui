import {GitignoreFilter, GlobFilter, IncludeExcludeFilter} from './filter';
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

test('filters glob with starting file patterns', t => {
  const filter = new GlobFilter({
    negate: true,
    patterns: ['**/.*', '**/_*'],
  });

  t.deepEqual(
    filter.filter([
      'a.md',
      'b.js',
      'c.txt',
      '/.config.json',
      '/_config.json',
      '/dir/file.txt',
      '/dir/_config.txt',
      '/dir/.config.txt',
    ]),
    ['a.md', 'b.js', 'c.txt', '/dir/file.txt']
  );
});

test('filters gitignore with common ignore values', t => {
  const filter = new GitignoreFilter({
    patterns: ['node_modules', 'build', '*.pyc'],
  });

  t.deepEqual(
    filter.filter([
      '/content/a.md',
      '/content/b.js',
      '/content/c.txt',
      '/node_modules/test/index.js',
      '/build/index.html',
      '/src/file.py',
      '/src/file.pyc',
    ]),
    ['/content/a.md', '/content/b.js', '/content/c.txt', '/src/file.py']
  );
});
