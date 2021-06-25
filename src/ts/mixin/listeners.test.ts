import {Base} from '@blinkk/selective-edit/dist/mixins';
import {ListenersMixin} from './listeners';
import test from 'ava';

test('can trigger listeners', t => {
  t.plan(1);

  const listenerCls = new TestListeners();

  // Can add an listener callback.
  listenerCls.addListener('test', arg => {
    t.is(arg, 'foo');
  });

  // Trigger the listener with an argument.
  listenerCls.triggerListener('test', 'foo');
});

class TestListeners extends ListenersMixin(Base) {}
