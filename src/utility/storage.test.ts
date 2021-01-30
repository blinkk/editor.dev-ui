import {Storage} from './storage';
import test from 'ava';

test('getItem null in tests', t => {
  const storage = new Storage(true);
  t.is(storage.getItem('test'), null);
});
