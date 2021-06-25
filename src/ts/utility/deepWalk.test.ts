import {DeepWalk, TransformFunction, TransformFunctionSync} from './deepWalk';
import {DataType} from '@blinkk/selective-edit/dist/utility/dataType';
import test from 'ava';

test('selectively replace strings in record', async t => {
  t.plan(1);
  const walker = new DeepWalk({});
  const transformValue = async (value: any) => {
    if (DataType.isString(value)) {
      return `foo${value}`;
    }
    return value;
  };

  t.deepEqual(
    await walker.walk(
      {
        foo: ['bar', ['bub'], {eeb: 'loo'}],
        test: {
          floo: 'baz',
          bab: ['tar'],
          subtest: {
            hub: 'web',
          },
        },
        bar: 1,
        baz: 'boo',
      },
      transformValue
    ),
    {
      foo: ['foobar', ['foobub'], {eeb: 'fooloo'}],
      test: {
        floo: 'foobaz',
        bab: ['footar'],
        subtest: {
          hub: 'fooweb',
        },
      },
      bar: 1,
      baz: 'fooboo',
    }
  );
});

test('selectively replace strings in array', async t => {
  t.plan(1);
  const walker = new DeepWalk({});
  const transformValue = async (value: any) => {
    if (DataType.isString(value)) {
      return `foo${value}`;
    }
    return value;
  };

  t.deepEqual(
    await walker.walk(['bar', ['bub'], {eeb: 'loo'}], transformValue),
    ['foobar', ['foobub'], {eeb: 'fooloo'}]
  );
});

test('selectively replace array custom', async t => {
  t.plan(1);

  class TestCustomWalker extends DeepWalk {
    protected async walkArray(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      originalValue: Array<any>,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      transformValue: TransformFunction
    ) {
      return ['foo'];
    }
  }
  const walker = new TestCustomWalker({});

  const transformValue = async (value: any) => {
    if (DataType.isString(value)) {
      return `foo${value}`;
    }
    return value;
  };

  t.deepEqual(
    await walker.walk(
      {
        foo: ['bar'],
        test: {
          floo: 'baz',
        },
        bar: 1,
        baz: 'boo',
      },
      transformValue
    ),
    {
      foo: ['foo'],
      test: {
        floo: 'foobaz',
      },
      bar: 1,
      baz: 'fooboo',
    }
  );
});

test('selectively replace objects custom', async t => {
  t.plan(1);

  class TestCustomWalker extends DeepWalk {
    protected async walkRecord(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      originalValue: Record<string, any>,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      transformValue: TransformFunction
    ) {
      return {
        foo: true,
      };
    }
  }
  const walker = new TestCustomWalker({});

  const transformValue = async (value: any) => {
    if (DataType.isString(value)) {
      return `foo${value}`;
    }
    return value;
  };

  t.deepEqual(
    await walker.walk(
      {
        foo: ['bar'],
        test: {
          floo: 'baz',
        },
        bar: 1,
        baz: 'boo',
      },
      transformValue
    ),
    {
      foo: true,
    }
  );
});

test('selectively replace strings in record sync', t => {
  t.plan(1);
  const walker = new DeepWalk({});
  const transformValue = (value: any) => {
    if (DataType.isString(value)) {
      return `foo${value}`;
    }
    return value;
  };

  t.deepEqual(
    walker.walkSync(
      {
        foo: ['bar', ['bub'], {eeb: 'loo'}],
        test: {
          floo: 'baz',
          bab: ['tar'],
          subtest: {
            hub: 'web',
          },
        },
        bar: 1,
        baz: 'boo',
      },
      transformValue
    ),
    {
      foo: ['foobar', ['foobub'], {eeb: 'fooloo'}],
      test: {
        floo: 'foobaz',
        bab: ['footar'],
        subtest: {
          hub: 'fooweb',
        },
      },
      bar: 1,
      baz: 'fooboo',
    }
  );
});

test('selectively replace strings in array sync', t => {
  t.plan(1);
  const walker = new DeepWalk({});
  const transformValue = (value: any) => {
    if (DataType.isString(value)) {
      return `foo${value}`;
    }
    return value;
  };

  t.deepEqual(walker.walkSync(['bar', ['bub'], {eeb: 'loo'}], transformValue), [
    'foobar',
    ['foobub'],
    {eeb: 'fooloo'},
  ]);
});

test('selectively replace array custom sync', t => {
  t.plan(1);

  class TestCustomWalker extends DeepWalk {
    protected walkArraySync(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      originalValue: Array<any>,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      transformValue: TransformFunctionSync
    ) {
      return ['foo'];
    }
  }
  const walker = new TestCustomWalker({});

  const transformValue = (value: any) => {
    if (DataType.isString(value)) {
      return `foo${value}`;
    }
    return value;
  };

  t.deepEqual(
    walker.walkSync(
      {
        foo: ['bar'],
        test: {
          floo: 'baz',
        },
        bar: 1,
        baz: 'boo',
      },
      transformValue
    ),
    {
      foo: ['foo'],
      test: {
        floo: 'foobaz',
      },
      bar: 1,
      baz: 'fooboo',
    }
  );
});

test('selectively replace objects custom sync', t => {
  t.plan(1);

  class TestCustomWalker extends DeepWalk {
    protected walkRecordSync(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      originalValue: Record<string, any>,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      transformValue: TransformFunctionSync
    ) {
      return {
        foo: true,
      };
    }
  }
  const walker = new TestCustomWalker({});

  const transformValue = async (value: any) => {
    if (DataType.isString(value)) {
      return `foo${value}`;
    }
    return value;
  };

  t.deepEqual(
    walker.walkSync(
      {
        foo: ['bar'],
        test: {
          floo: 'baz',
        },
        bar: 1,
        baz: 'boo',
      },
      transformValue
    ),
    {
      foo: true,
    }
  );
});
