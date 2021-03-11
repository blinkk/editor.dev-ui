import {Base} from '@blinkk/selective-edit/dist/src/mixins';
import {FilelistMixin} from './filelist';
import test from 'ava';

test('can access filelist ui', t => {
  const filelistCls = new TestFilelist();

  t.truthy(filelistCls.filelistUi);
});

class TestFilelist extends FilelistMixin(Base) {}
