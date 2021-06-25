import {ServiceServerApi} from '../api';
import {SessionDataStorage} from '../../utility/dataStorage';
import {generateUUID} from '@blinkk/selective-edit/dist/utility/uuid';

const CLIENT_ID = 'Iv1.e422a5bfa1197db1';
const sessionStorage = new SessionDataStorage();

/**
 * Example api that returns data through a 'simulated' network.
 */
export class GithubApi extends ServiceServerApi {
  /**
   * Verify that the authentication for services that require auth.
   *
   * @returns True if the auth checks out.
   */
  checkAuth(): boolean {
    let githubState = sessionStorage.getItem('github.state');
    if (!githubState) {
      githubState = generateUUID();
      sessionStorage.setItem('github.state', githubState);
    }

    const githubCode = sessionStorage.getItem('github.code');
    if (!githubCode) {
      // Save the current url to redirect back to after auth.
      sessionStorage.setItem('redirectUrl', window.location.href);

      const loginUrl = new URL('/login/oauth/authorize', 'https://github.com');

      const loginParams = new URLSearchParams();
      loginParams.set('client_id', CLIENT_ID);
      loginParams.set('redirect_uri', `${window.location.origin}/gh/callback/`);
      loginParams.set('state', githubState);

      loginUrl.search = loginParams.toString();
      console.log('login URL: ', loginUrl.toString());

      window.location.href = loginUrl.toString();
      return false;
    }
    return true;
  }

  /**
   * Specific services may need to add additional params to all of
   * the api request (such as authentication params.)
   *
   * @param params Params being sent to the api.
   * @returns Updated params to send to the api.
   */
  expandParams(params: Record<string, any>): Record<string, any> {
    params['githubState'] = sessionStorage.getItem('github.state');
    params['githubCode'] = sessionStorage.getItem('github.code');
    return params;
  }
}
