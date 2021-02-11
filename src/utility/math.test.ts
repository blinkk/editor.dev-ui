import {greatestCommonDenominator, reduceFraction} from './math';
import test from 'ava';

test('already at greatest common denominator', t => {
  t.is(greatestCommonDenominator(1, 5), 1);
});

test('simple greatest common denominator', t => {
  t.is(greatestCommonDenominator(2, 10), 2);
});

test('greatest common denominator', t => {
  t.is(greatestCommonDenominator(143, 26), 13);
});

test('already reduced fraction', t => {
  t.deepEqual(reduceFraction(1, 5), [1, 5]);
});

test('reduce fraction', t => {
  t.deepEqual(reduceFraction(26, 130), [1, 5]);
});
