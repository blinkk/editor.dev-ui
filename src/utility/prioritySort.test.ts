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
];

test('sort without priority keys', t => {
  const compareSort = createPriorityKeySort([]);
  t.deepEqual([...outOfOrderKeys].sort(compareSort), [
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
    'foo',
    'label',
    'partials',
  ]);
});
