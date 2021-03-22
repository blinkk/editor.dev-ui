import {DataStorage} from './dataStorage';
import test from 'ava';

test('DataStorage clear no-op in tests', t => {
  const storage = new DataStorage();
  t.is(storage.clear(), undefined);
});

test('DataStorage getItem null in tests', t => {
  const storage = new DataStorage();
  t.is(storage.getItem('test'), null);
});

test('DataStorage getItemArray empty in tests', t => {
  const storage = new DataStorage();
  t.deepEqual(storage.getItemArray('test'), []);
});

test('DataStorage getItemBoolean default in tests', t => {
  const storage = new DataStorage();
  t.is(storage.getItemBoolean('test'), false);
  t.is(storage.getItemBoolean('test', true), true);
});

test('DataStorage getItemRecord empty in tests', t => {
  const storage = new DataStorage();
  t.deepEqual(storage.getItemRecord('test'), {});
});

test('DataStorage setItem no-op in tests', t => {
  const storage = new DataStorage();
  t.is(storage.getItem('test'), null);
  storage.setItem('test', 'foo');
  t.is(storage.getItem('test'), null);
});

test('DataStorage setItemArray no-op in tests', t => {
  const storage = new DataStorage();
  t.deepEqual(storage.getItemArray('test'), []);
  storage.setItemArray('test', ['foo']);
  t.deepEqual(storage.getItemArray('test'), []);
});

test('DataStorage setItemBoolean no-op in tests', t => {
  const storage = new DataStorage();
  t.is(storage.getItemBoolean('test'), false);
  storage.setItemBoolean('test', true);
  t.is(storage.getItemBoolean('test'), false);
});

test('DataStorage setItemRecord no-op in tests', t => {
  const storage = new DataStorage();
  t.deepEqual(storage.getItemRecord('test'), {});
  storage.setItemRecord('test', {foo: 'bar'});
  t.deepEqual(storage.getItemRecord('test'), {});
});
