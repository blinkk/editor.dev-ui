import {
  GitHubBranchInfo,
  GitHubInstallationInfo,
  GitHubOrgInstallationInfo,
  WorkspaceData,
} from '../../editor/api';
import {ServiceServerApi, postJSON} from '../api';

import {LocalDataStorage} from '../../utility/dataStorage';
import {generateUUID} from '@blinkk/selective-edit/dist/utility/uuid';

const CLIENT_ID = 'Iv1.e422a5bfa1197db1';

/**
 * Login information will persist until the local storage is cleared.
 * The user can use the logout option in the app header, otherwise the
 * authentication will persist as long as the server keeps the OAuth
 * credentials.
 */
const loginStorage = new LocalDataStorage();

/**
 * Example api that returns data through a 'simulated' network.
 */
export class GitHubApi extends ServiceServerApi {
  /**
   * Verify that the authentication for services that require auth.
   *
   * @returns True if the auth is valid.
   */
  checkAuth(): boolean {
    const githubCode = loginStorage.getItem('github.code');
    if (!githubCode) {
      return false;
    }
    return true;
  }

  /**
   * Clear the authentication. Sign the user out of any accounts.
   */
  async clearAuth(): Promise<void> {
    // Server request to clear auth.
    await postJSON(this.resolveApiUrl('/auth.clear'), this.expandParams({}));

    // Clear the local authentication information.
    loginStorage.removeItem('github.code');
    loginStorage.removeItem('github.state');
  }

  /**
   * Specific services may need to add additional params to all of
   * the api request (such as authentication params.)
   *
   * @param params Params being sent to the api.
   * @returns Updated params to send to the api.
   */
  expandParams(params: Record<string, any>): Record<string, any> {
    params['githubState'] = loginStorage.getItem('github.state');
    params['githubCode'] = loginStorage.getItem('github.code');
    return params;
  }

  async getBranches(
    org: string,
    repo: string
  ): Promise<Array<GitHubBranchInfo>> {
    return postJSON(
      this.resolveApiGenericUrl('/branches.get'),
      this.expandParams({
        org: org,
        repo: repo,
      })
    ) as Promise<Array<GitHubBranchInfo>>;
  }

  async getOrganizations(): Promise<Array<GitHubInstallationInfo>> {
    return postJSON(
      this.resolveApiGenericUrl('/organizations.get'),
      this.expandParams({})
    ) as Promise<Array<GitHubInstallationInfo>>;
  }

  async getRepositories(
    installationId: number
  ): Promise<Array<GitHubOrgInstallationInfo>> {
    return postJSON(
      this.resolveApiGenericUrl('/repositories.get'),
      this.expandParams({
        installationId: installationId,
      })
    ) as Promise<Array<GitHubOrgInstallationInfo>>;
  }

  async getWorkspaces(
    org?: string,
    repo?: string
  ): Promise<Array<WorkspaceData>> {
    if (org && repo) {
      return postJSON(
        this.resolveApiGenericUrl('/workspaces.get'),
        this.expandParams({
          org: org,
          repo: repo,
        })
      ) as Promise<Array<WorkspaceData>>;
    }
    return postJSON(
      this.resolveApiUrl('/workspaces.get'),
      this.expandParams({})
    ) as Promise<Array<WorkspaceData>>;
  }

  get serviceName(): string {
    return 'GitHub';
  }

  /**
   * Start the authentication process.
   */
  triggerAuth() {
    // Save the current url to redirect back to after auth.
    loginStorage.setItem('redirectUrl', window.location.href);

    let state = loginStorage.getItem('github.state');
    if (!state) {
      state = generateUUID();
      loginStorage.setItem('github.state', state);
    }

    const loginUrl = new URL('/login/oauth/authorize', 'https://github.com');

    const loginParams = new URLSearchParams();
    loginParams.set('client_id', CLIENT_ID);
    loginParams.set('redirect_uri', `${window.location.origin}/gh/callback/`);
    loginParams.set('state', state);
    loginUrl.search = loginParams.toString();

    window.location.href = loginUrl.toString();

    return false;
  }
}
