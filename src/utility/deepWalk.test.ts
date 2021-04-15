import {DataType} from '@blinkk/selective-edit/dist/src/utility/dataType';
import {DeepWalk} from './deepWalk';
import test from 'ava';

test('selectively replace strings', async t => {
  t.plan(1);
  const walker = new DeepWalk({});
  const transformValue = (value: any) => {
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
      foo: ['foobar'],
      test: {
        floo: 'foobaz',
      },
      bar: 1,
      baz: 'fooboo',
    }
  );
});
