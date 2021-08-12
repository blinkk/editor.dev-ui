import {LocalDataStorage} from '../../utility/dataStorage';

const sessionStorage = new LocalDataStorage();
const redirectUrl = sessionStorage.getItem('redirectUrl') || '/';

const githubState = sessionStorage.getItem('github.state');
if (!githubState) {
  // No github state, did not come from the current session.
  // redirect back to the editor.
  console.error('No state defined.');

  window.location.href = redirectUrl;
}

const callbackUrl = new URL(window.location.href);
const callbackState = callbackUrl.searchParams.get('state');

if (githubState === callbackState) {
  const callbackCode = callbackUrl.searchParams.get('code');
  sessionStorage.setItem('github.code', callbackCode as string);
}

window.location.href = redirectUrl;
