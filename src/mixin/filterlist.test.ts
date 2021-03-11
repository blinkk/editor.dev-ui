import {Base} from '@blinkk/selective-edit/dist/src/mixins';
import {FilterlistMixin} from './filterlist';
import test from 'ava';

test('can access filterlist ui', t => {
  const filterlistCls = new TestFilterlist();

  const filterListUi = filterlistCls.filterlistUi;
  t.truthy(filterListUi);
  t.is(filterListUi, filterlistCls.filterlistUi);
});

class TestFilterlist extends FilterlistMixin(Base) {}
