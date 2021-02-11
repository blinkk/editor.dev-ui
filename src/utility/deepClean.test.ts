import {DeepClean} from './deepClean';
import test from 'ava';

test('remove empty objects', t => {
  const cleaner = new DeepClean({
    removeEmptyObjects: true,
  });

  // Main level empty object.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: {},
    }),
    {
      foo: 'bar',
    }
  );

  // Nested empty object.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: {
        floo: 'baz',
        bar: {},
      },
    }),
    {
      foo: 'bar',
      test: {
        floo: 'baz',
      },
    }
  );

  // Nested empty objects in sequence.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: {
        bar: {},
      },
    }),
    {
      foo: 'bar',
    }
  );

  t.deepEqual(cleaner.clean(['bar', {}]), ['bar']);
});
