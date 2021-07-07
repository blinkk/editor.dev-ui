import {
  expandWorkspaceBranch,
  isWorkspaceBranch,
  shortenWorkspaceName,
} from './workspace';
import test from 'ava';

test('workspace branch expansion', t => {
  // Special branches.
  t.is(expandWorkspaceBranch('master'), 'master');
  t.is(expandWorkspaceBranch('main'), 'main');
  t.is(expandWorkspaceBranch('staging'), 'staging');

  // Normal workspace branches.
  t.is(expandWorkspaceBranch('foo'), 'workspace/foo');
  t.is(expandWorkspaceBranch('bar'), 'workspace/bar');
});

test('is workspace branch', t => {
  // Special branches.
  t.is(isWorkspaceBranch('master'), true);
  t.is(isWorkspaceBranch('main'), true);
  t.is(isWorkspaceBranch('staging'), true);

  // Normal workspace branches.
  t.is(isWorkspaceBranch('workspace/foo'), true);
  t.is(isWorkspaceBranch('workspace/bar'), true);

  // Non-workspace branches.
  t.is(isWorkspaceBranch('feature/foo'), false);
  t.is(isWorkspaceBranch('bug/bar'), false);
  t.is(isWorkspaceBranch('foogoo'), false);
});

test('shorten workspace branch', t => {
  // Special branches.
  t.is(shortenWorkspaceName('master'), 'master');
  t.is(shortenWorkspaceName('main'), 'main');
  t.is(shortenWorkspaceName('staging'), 'staging');

  // Normal workspace branches.
  t.is(shortenWorkspaceName('workspace/foo'), 'foo');
  t.is(shortenWorkspaceName('workspace/bar'), 'bar');

  // Non-workspace branches.
  t.is(shortenWorkspaceName('feature/foo'), 'feature/foo');
  t.is(shortenWorkspaceName('bug/bar'), 'bug/bar');
  t.is(shortenWorkspaceName('foogoo'), 'foogoo');
});
