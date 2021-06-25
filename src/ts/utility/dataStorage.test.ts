import {DataStorage} from './dataStorage';
import test from 'ava';

test('DataStorage clear', t => {
  const storage = new DataStorage();
  t.is(storage.getItem('test'), null);
  t.is(storage.setItem('test', 'foo'), undefined);
  t.is(storage.getItem('test'), 'foo');
  t.is(storage.clear(), undefined);
  t.is(storage.getItem('test'), null);
});

test('DataStorage getItem null', t => {
  const storage = new DataStorage();
  t.is(storage.getItem('test'), null);
});

test('DataStorage getItemArray empty', t => {
  const storage = new DataStorage();
  t.deepEqual(storage.getItemArray('test'), []);
});

test('DataStorage getItemBoolean default', t => {
  const storage = new DataStorage();
  t.is(storage.getItemBoolean('test'), false);
  t.is(storage.getItemBoolean('test', true), true);
});

test('DataStorage getItemRecord empty', t => {
  const storage = new DataStorage();
  t.deepEqual(storage.getItemRecord('test'), {});
});

test('DataStorage key', t => {
  const storage = new DataStorage();
  t.is(storage.getItem('test'), null);
  storage.setItem('test', 'foo');
  t.is(storage.getItem('test'), 'foo');
  t.is(storage.key(0), 'foo');
  t.is(storage.key(1), null);
});

test('DataStorage length', t => {
  const storage = new DataStorage();
  t.is(storage.length, 0);
  storage.setItem('test', 'foo');
  t.is(storage.length, 1);
});

test('DataStorage removeItem', t => {
  const storage = new DataStorage();
  t.is(storage.getItem('test'), null);
  storage.setItem('test', 'foo');
  t.is(storage.getItem('test'), 'foo');
  storage.removeItem('test');
  t.is(storage.getItem('test'), null);
});

test('DataStorage setItem', t => {
  const storage = new DataStorage();
  t.is(storage.getItem('test'), null);
  storage.setItem('test', 'foo');
  t.is(storage.getItem('test'), 'foo');
});

test('DataStorage setItemArray', t => {
  const storage = new DataStorage();
  t.deepEqual(storage.getItemArray('test'), []);
  storage.setItemArray('test', ['foo']);
  t.deepEqual(storage.getItemArray('test'), ['foo']);
});

test('DataStorage setItemBoolean true', t => {
  const storage = new DataStorage();
  t.is(storage.getItemBoolean('test'), false);
  storage.setItemBoolean('test', true);
  t.is(storage.getItemBoolean('test'), true);
});

test('DataStorage setItemBoolean false', t => {
  const storage = new DataStorage();
  t.is(storage.getItemBoolean('test'), false);
  storage.setItemBoolean('test', false);
  t.is(storage.getItemBoolean('test'), false);
});

test('DataStorage setItemRecord', t => {
  const storage = new DataStorage();
  t.deepEqual(storage.getItemRecord('test'), {});
  storage.setItemRecord('test', {foo: 'bar'});
  t.deepEqual(storage.getItemRecord('test'), {foo: 'bar'});
});
