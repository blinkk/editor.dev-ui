import {AutoCompleteMixin} from './autocomplete';
import {Base} from '@blinkk/selective-edit/dist/src/mixins';
import test from 'ava';

test('can access autoComplete ui', t => {
  const autoCompleteCls = new TestAutoComplete();

  const filterListUi = autoCompleteCls.autoCompleteUi;
  t.truthy(filterListUi);
  t.is(filterListUi, autoCompleteCls.autoCompleteUi);
});

class TestAutoComplete extends AutoCompleteMixin(Base) {}
