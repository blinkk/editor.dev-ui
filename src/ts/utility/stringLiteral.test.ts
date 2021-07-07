import {interpolate} from './stringLiteral';
import test from 'ava';

test('correctly interpolates text with params', t => {
  t.is(interpolate({foo: 'bar'}, 'test ${foo}'), 'test bar');
  t.is(interpolate({foo: 'bar'}, 'test ${foo} ${foo.length}'), 'test bar 3');
});

test('error with interpolates with unknown param', t => {
  t.throws(() => {
    interpolate({foo: 'bar'}, 'test ${foo} ${bar}');
  });
});
