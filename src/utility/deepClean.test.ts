import {DeepClean} from './deepClean';
import test from 'ava';

test('protected key patterns', t => {
  const cleaner = new DeepClean({
    protectedKeyPatterns: ['foo', 'bar.*', /baz$/],
    removeNulls: true,
  });

  t.deepEqual(
    cleaner.clean({
      clean: null,
      foo: null,
      barz: null,
      lubaz: null,
    }),
    {
      foo: null,
      barz: null,
      lubaz: null,
    }
  );
});

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

test('remove by key', t => {
  const cleaner = new DeepClean({
    removeKeys: ['foo'],
  });

  // Main level key.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: undefined,
    }),
    {
      test: undefined,
    }
  );

  // Deep key.
  t.deepEqual(
    cleaner.clean({
      foo: 'bar',
      test: {
        foo: 'baz',
      },
    }),
    {
      test: {},
    }
  );

  // Array with key.
  t.deepEqual(
    cleaner.clean([
      {
        foo: 'bar',
        test: ['baz'],
      },
    ]),
    [
      {
        test: ['baz'],
      },
    ]
  );
});
