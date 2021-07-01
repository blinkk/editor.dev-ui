import {
  GithubBranchInfo,
  GithubInstallationInfo,
  GithubOrgInstallationInfo,
  WorkspaceData,
} from '../../editor/api';
import {ServiceServerApi, postJSON} from '../api';

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
    const githubCode = sessionStorage.getItem('github.code');
    if (!githubCode) {
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

  async getBranches(
    org: string,
    repo: string
  ): Promise<Array<GithubBranchInfo>> {
    return postJSON(
      this.resolveApiGenericUrl('/branches.get'),
      this.expandParams({
        org: org,
        repo: repo,
      })
    ) as Promise<Array<GithubBranchInfo>>;
  }

  async getOrganizations(): Promise<Array<GithubInstallationInfo>> {
    return postJSON(
      this.resolveApiGenericUrl('/organizations.get'),
      this.expandParams({})
    ) as Promise<Array<GithubInstallationInfo>>;
  }

  async getRepositories(
    installationId: number
  ): Promise<Array<GithubOrgInstallationInfo>> {
    return postJSON(
      this.resolveApiGenericUrl('/repositories.get'),
      this.expandParams({
        installationId: installationId,
      })
    ) as Promise<Array<GithubOrgInstallationInfo>>;
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

  /**
   * Start the authentication process.
   */
  triggerAuth() {
    // Save the current url to redirect back to after auth.
    sessionStorage.setItem('redirectUrl', window.location.href);

    let state = sessionStorage.getItem('github.state');
    if (!state) {
      state = generateUUID();
      sessionStorage.setItem('github.state', state);
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
