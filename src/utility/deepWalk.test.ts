import {
  DeepWalk,
  TransformArrayFunction,
  TransformArrayFunctionSync,
  TransformFunction,
  TransformFunctionSync,
  TransformRecordFunction,
  TransformRecordFunctionSync,
} from './deepWalk';
import {DataType} from '@blinkk/selective-edit/dist/src/utility/dataType';
import test from 'ava';

test('selectively replace strings', async t => {
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
        foo: ['bar'],
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
      foo: ['foobar'],
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

test('selectively replace array custom', async t => {
  t.plan(1);
  const walker = new DeepWalk({});
  const transformValue = async (value: any) => {
    if (DataType.isString(value)) {
      return `foo${value}`;
    }
    return value;
  };
  const transformArray = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    originalValue: Array<any>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transformValue: TransformFunction,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transformArray: TransformArrayFunction,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transformRecord: TransformRecordFunction
  ) => {
    return ['foo'];
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
      transformValue,
      transformArray
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
  const walker = new DeepWalk({});
  const transformValue = async (value: any) => {
    if (DataType.isString(value)) {
      return `foo${value}`;
    }
    return value;
  };
  const transformRecord = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    originalValue: Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transformValue: TransformFunction,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transformArray: TransformArrayFunction,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transformRecord: TransformRecordFunction
  ) => {
    return {
      foo: true,
    };
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
      transformValue,
      undefined,
      transformRecord
    ),
    {
      foo: true,
    }
  );
});

test('selectively replace strings sync', t => {
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
        foo: ['bar'],
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
      foo: ['foobar'],
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

test('selectively replace array custom sync', t => {
  t.plan(1);
  const walker = new DeepWalk({});
  const transformValue = (value: any) => {
    if (DataType.isString(value)) {
      return `foo${value}`;
    }
    return value;
  };
  const transformArray = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    originalValue: Array<any>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transformValue: TransformFunctionSync,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transformArray: TransformArrayFunctionSync,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transformRecord: TransformRecordFunctionSync
  ) => {
    return ['foo'];
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
      transformValue,
      transformArray
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
  const walker = new DeepWalk({});
  const transformValue = async (value: any) => {
    if (DataType.isString(value)) {
      return `foo${value}`;
    }
    return value;
  };
  const transformRecord = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    originalValue: Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transformValue: TransformFunctionSync,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transformArray: TransformArrayFunctionSync,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transformRecord: TransformRecordFunctionSync
  ) => {
    return {
      foo: true,
    };
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
      transformValue,
      undefined,
      transformRecord
    ),
    {
      foo: true,
    }
  );
});
