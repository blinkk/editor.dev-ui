import {DataStorage} from './dataStorage';
import test from 'ava';

test('clear no-op in tests', t => {
  const storage = new DataStorage(true);
  t.is(storage.clear(), undefined);
});

test('getItem null in tests', t => {
  const storage = new DataStorage(true);
  t.is(storage.getItem('test'), null);
});

test('getItemArray empty in tests', t => {
  const storage = new DataStorage(true);
  t.deepEqual(storage.getItemArray('test'), []);
});

test('getItemBoolean default in tests', t => {
  const storage = new DataStorage(true);
  t.is(storage.getItemBoolean('test'), false);
  t.is(storage.getItemBoolean('test', true), true);
});

test('getItemRecord empty in tests', t => {
  const storage = new DataStorage(true);
  t.deepEqual(storage.getItemRecord('test'), {});
});

test('setItem no-op in tests', t => {
  const storage = new DataStorage(true);
  t.is(storage.getItem('test'), null);
  storage.setItem('test', 'foo');
  t.is(storage.getItem('test'), null);
});

test('setItemArray no-op in tests', t => {
  const storage = new DataStorage(true);
  t.deepEqual(storage.getItemArray('test'), []);
  storage.setItemArray('test', ['foo']);
  t.deepEqual(storage.getItemArray('test'), []);
});

test('setItemBoolean no-op in tests', t => {
  const storage = new DataStorage(true);
  t.is(storage.getItemBoolean('test'), false);
  storage.setItemBoolean('test', true);
  t.is(storage.getItemBoolean('test'), false);
});

test('setItemRecord no-op in tests', t => {
  const storage = new DataStorage(true);
  t.deepEqual(storage.getItemRecord('test'), {});
  storage.setItemRecord('test', {foo: 'bar'});
  t.deepEqual(storage.getItemRecord('test'), {});
});
