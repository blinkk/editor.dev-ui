import {createPriorityKeySort} from './prioritySort';
import test from 'ava';

const outOfOrderKeys = [
  'foo',
  'title',
  'partials',
  'key',
  'partial',
  'label',
  'bar',
  'bar', // Test duplicate key.
];

test('sort without priority keys', t => {
  const compareSort = createPriorityKeySort([]);
  t.deepEqual([...outOfOrderKeys].sort(compareSort), [
    'bar',
    'bar',
    'foo',
    'key',
    'label',
    'partial',
    'partials',
    'title',
  ]);
});

test('sort with priority keys', t => {
  const compareSort = createPriorityKeySort(['partial', 'title', 'key']);
  t.deepEqual([...outOfOrderKeys].sort(compareSort), [
    'partial',
    'title',
    'key',
    'bar',
    'bar',
    'foo',
    'label',
    'partials',
  ]);
});
