import {slugify} from './slugify';
import test from 'ava';

test('correctly slugifies values', t => {
  t.is(slugify('test'), 'test');
  t.is(slugify('test with spaces'), 'test_with_spaces');
  t.is(slugify('test with punctuation!'), 'test_with_punctuation');
  t.is(slugify('CapItaLizAtioN'), 'capitalization');
});
