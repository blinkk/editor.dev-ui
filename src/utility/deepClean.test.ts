import {DeepClean} from './deepClean';
import test from 'ava';

test('remove empty arrays', t => {
  const cleaner = new DeepClean({
    removeEmptyArrays: true,
  });

  // Main level empty object.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: [],
    }),
    {
      foo: 'bar',
    }
  );

  // Deep empty object.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: {
        floo: 'baz',
        bar: [],
      },
    }),
    {
      foo: 'bar',
      test: {
        floo: 'baz',
      },
    }
  );

  // Array with empty object.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: ['baz', []],
    }),
    {
      foo: 'bar',
      test: ['baz'],
    }
  );

  // Nested empty arrays.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: [[]],
    }),
    {
      foo: 'bar',
    }
  );

  t.deepEqual(cleaner.clean(['bar', []]), ['bar']);
});

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

  // Deep empty object.
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

  // Array with empty object.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: ['baz', {}],
    }),
    {
      foo: 'bar',
      test: ['baz'],
    }
  );

  // Nested empty objects in depth.
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

test('remove empty strings', t => {
  const cleaner = new DeepClean({
    removeEmptyStrings: true,
  });

  // Main level empty object.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: '',
    }),
    {
      foo: 'bar',
    }
  );

  // Whitespace only.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: '  ',
    }),
    {
      foo: 'bar',
    }
  );

  // Deep empty object.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: {
        floo: 'baz',
        bar: '',
      },
    }),
    {
      foo: 'bar',
      test: {
        floo: 'baz',
      },
    }
  );

  // Array with empty object.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: ['baz', ''],
    }),
    {
      foo: 'bar',
      test: ['baz'],
    }
  );

  t.deepEqual(cleaner.clean(['bar', '']), ['bar']);
});

test('remove nulls', t => {
  const cleaner = new DeepClean({
    removeNulls: true,
  });

  // Main level empty object.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: null,
    }),
    {
      foo: 'bar',
    }
  );

  // Deep empty object.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: {
        floo: 'baz',
        bar: null,
      },
    }),
    {
      foo: 'bar',
      test: {
        floo: 'baz',
      },
    }
  );

  // Array with empty object.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: ['baz', null],
    }),
    {
      foo: 'bar',
      test: ['baz'],
    }
  );

  t.deepEqual(cleaner.clean(['bar', null]), ['bar']);
});

test('remove undefineds', t => {
  const cleaner = new DeepClean({
    removeUndefineds: true,
  });

  // Main level empty object.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: undefined,
    }),
    {
      foo: 'bar',
    }
  );

  // Deep empty object.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: {
        floo: 'baz',
        bar: undefined,
      },
    }),
    {
      foo: 'bar',
      test: {
        floo: 'baz',
      },
    }
  );

  // Array with empty object.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: ['baz', undefined],
    }),
    {
      foo: 'bar',
      test: ['baz'],
    }
  );

  t.deepEqual(cleaner.clean(['bar', undefined]), ['bar']);
});
