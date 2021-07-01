import {EditorApp, EditorAppOptions} from './editorApp';
import {
  GithubBranchInfo,
  GithubInstallationInfo,
  GithubOrgInstallationInfo,
  LiveEditorApiComponent,
  WorkspaceData,
} from '../../editor/api';
import {TemplateResult, html, repeat} from '@blinkk/selective-edit';

import {GCSRemoteMedia} from '../../remoteMedia/GCSRemoteMedia';
import {GithubApi} from '../gh/githubApi';
import {RemoteMediaConstructor} from '../../remoteMedia';
import {ServerApiComponent} from '../api';
import {ServiceOnboarding} from './service';
import {templateLoading} from '../../editor/template';

const APP_URL = 'https://github.com/apps/editor-dev';
const BASE_URL = '/gh/';

/**
 * Do not want to have normal link clicks redirect, but still want
 * links to be able to be opened in a new tab.
 */
const preventNormalLinks = (evt: KeyboardEvent) => {
  if (evt.ctrlKey || evt.shiftKey || evt.metaKey) {
    // Stop the upstream click handler from triggering.
    evt.stopPropagation();
    return;
  }
  evt.preventDefault();
};

export interface GithubEditorAppOptions extends EditorAppOptions {
  organization?: string;
  project?: string;
  branch?: string;
}

export class GithubEditorApp extends EditorApp {
  options?: GithubEditorAppOptions;
  protected _api: (LiveEditorApiComponent & ServerApiComponent) | null;

  constructor(container: HTMLElement, options?: GithubEditorAppOptions) {
    super(container, options);
    this.options = options || {};
    this._api = null;

    // Determine which pieces of information we know from the URL.
    const urlParts = window.location.pathname
      .split('/')
      .filter(value => value.length) // Do not need empty items.
      .slice(1); // Remove the service portion of url.

    if (urlParts.length >= 1) {
      this.options.organization = urlParts[0];
    }
    if (urlParts.length >= 2) {
      this.options.project = urlParts[1];
    }
    if (urlParts.length >= 3) {
      this.options.branch = urlParts[2];
    }
    if (urlParts.length >= 4) {
      this.initialFile = `/${urlParts.slice(3).join('/')}`;
    }
  }

  get api(): LiveEditorApiComponent & ServerApiComponent {
    if (this._api) {
      return this._api;
    }

    this._api = new GithubApi(
      'gh',
      this.options?.organization,
      this.options?.project,
      this.options?.branch,
      this.isUnstable,
      this.isDev
    );

    this._api.remoteMediaProviders.push(
      GCSRemoteMedia as unknown as RemoteMediaConstructor
    );

    return this._api;
  }

  async init() {
    // Check for information missing details needed for the editor.
    if (
      !this.options?.organization ||
      !this.options?.project ||
      !this.options?.branch
    ) {
      const onboarding = new GithubOnboarding(
        this.container,
        this.api as GithubApi
      );
      onboarding.render();
    } else {
      // Check if the user is signed in before rendering the editor.
      if (!this.api.checkAuth()) {
        (this.api as GithubApi).triggerAuth();
      } else {
        this.editor.render();
      }
    }
  }
}

class GithubOnboarding extends ServiceOnboarding {
  api: GithubApi;
  organizations?: Array<GithubInstallationInfo>;
  installation?: GithubInstallationInfo;
  repositories?: Array<GithubOrgInstallationInfo>;
  /**
   * Track the id that was used to load the repositories.
   * Reset the loaded repositories when the id does not match.
   * ex: on pop state.
   */
  repositoriesId?: number;
  service = 'GitHub';
  workspaces?: Array<WorkspaceData>;
  /**
   * Track the id that was used to load the workspaces.
   * Reset the loaded workspaces when the id does not match.
   * ex: on pop state.
   */
  workspacesId?: string;

  constructor(container: HTMLElement, api: GithubApi) {
    super(container, api);
    this.api = api;

    window.addEventListener('popstate', evt => {
      this.api.organization = evt.state?.organization;
      this.api.project = evt.state?.repository;
      this.api.branch = evt.state?.workspace;

      this.render();
    });
  }

  generateUrl(
    organization?: string,
    repository?: string,
    workspace?: string
  ): string {
    if (organization && repository && workspace) {
      return `${BASE_URL}${organization}/${repository}/${workspace}/`;
    } else if (organization && repository) {
      return `${BASE_URL}${organization}/${repository}/`;
    } else if (organization) {
      return `${BASE_URL}${organization}/`;
    }
    return BASE_URL;
  }

  loadWorkspaces() {
    this.api
      .getWorkspaces(this.api.organization, this.api.project)
      .then(workspaces => {
        this.workspaces = workspaces;
        this.workspacesId = this.api.project;
        this.render();
      })
      .catch(() => {
        console.error('Unable to retrieve the list of branches.');
      });
  }

  loadOrganizations() {
    this.api
      .getOrganizations()
      .then(organizations => {
        this.organizations = organizations;
        this.render();
      })
      .catch(() => {
        console.error('Unable to retrieve the list of organizations.');
      });
  }

  loadRepositories() {
    if (!this.organizations) {
      this.loadOrganizations();
    }

    // Search for the organization in the organization installations.
    if (!this.installation && this.api.organization && this.organizations) {
      for (const organization of this.organizations) {
        if (organization.org === this.api.organization) {
          this.installation = organization;
          break;
        }
      }

      // Unable to find the installation in the installations. Not installed.
      if (!this.installation) {
        console.error('No installation found for ', this.api.organization);
        this.repositories = [];
        this.render();
        return;
      }
    }

    // If the installation id has not been set the installations are loading.
    if (!this.installation) {
      return;
    }

    this.api
      .getRepositories(this.installation.id)
      .then(repositories => {
        this.repositories = repositories;
        this.repositoriesId = this.installation?.id;
        this.render();
      })
      .catch(() => {
        console.error('Unable to retrieve the list of repositories.');
      });
  }

  template(onboarding: ServiceOnboarding): TemplateResult {
    // Check if the user is signed in.
    if (!this.api.checkAuth()) {
      return this.templateLogin(onboarding);
    }

    // Determine which part of the selection is missing.
    if (!this.api.organization) {
      return this.templateOrganizations(onboarding);
    } else if (!this.api.project) {
      return this.templateRepositories(onboarding);
    }
    return this.templateWorkspaces(onboarding);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateLogin(onboarding: ServiceOnboarding): TemplateResult {
    return html`<div class="onboarding__login">
      <a class="button" href="#" @click=${this.api.triggerAuth}
        >Login to GitHub</a
      >
    </div>`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateOrganizations(onboarding: ServiceOnboarding): TemplateResult {
    if (!this.organizations) {
      this.loadOrganizations();
    }

    return html` <h2>Organizations</h2>
      ${this.organizations ? html`<p>Select an organization:</p>` : ''}
      <div class="le__list">
        ${repeat(
          this.organizations || [],
          org => org.id,
          org => {
            return html`<div
              class="le__list__item le__list__item--pad_small le__clickable"
              @click=${() => {
                this.api.organization = org.org;
                this.installation = org;

                history.pushState(
                  {
                    onboarding: true,
                    organization: this.api.organization,
                  },
                  org.org,
                  this.generateUrl(org.org)
                );

                this.render();
                return false;
              }}
            >
              <a href="${BASE_URL}${org.org}/" @click=${preventNormalLinks}
                >${org.org}</a
              >
            </div>`;
          }
        )}
        ${!this.organizations
          ? html`<div class="le__list__item">
              ${templateLoading({padHorizontal: true})} Finding organizations…
            </div>`
          : ''}
        ${this.organizations && !this.organizations.length
          ? html`<div
              class="le__list__item le__list__item--pad_small le__list__item--emphasis"
            >
              No organization access found.
            </div>`
          : ''}
      </div>
      <div class="onboarding__missing">
        <span class="material-icons">help_outline</span>
        <div>
          Unable to find repositories missing? Install the
          <a href=${APP_URL}>GitHub App</a>.
        </div>
      </div>`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateRepositories(onboarding: ServiceOnboarding): TemplateResult {
    // When using popstate, the repository id can be different than the cached selection.
    if (
      this.repositories &&
      this.repositoriesId &&
      this.installation?.id !== this.repositoriesId
    ) {
      this.repositories = undefined;
    }

    if (!this.repositories) {
      this.loadRepositories();
    }

    return html` <h2>Repositories in ${this.api.organization}</h2>
      <div class="le__list">
        ${this.repositories ? html`<p>Select a repository:</p>` : ''}
        ${repeat(
          this.repositories || [],
          repo => repo.repo,
          repo => {
            return html`<div
              class="le__list__item le__list__item--pad_small le__clickable"
              @click=${() => {
                this.api.project = repo.repo;

                history.pushState(
                  {
                    onboarding: true,
                    organization: this.api.organization,
                    repository: repo.repo,
                  },
                  repo.repo,
                  this.generateUrl(this.api.organization, repo.repo)
                );

                this.render();
                return false;
              }}
            >
              <a
                href="${BASE_URL}${repo.org}/${repo.repo}/"
                @click=${preventNormalLinks}
                >${repo.org}/${repo.repo}</a
              >
            </div>`;
          }
        )}
        ${!this.repositories
          ? html`<div class="le__list__item">
              ${templateLoading({padHorizontal: true})} Finding
              ${this.api.organization} repositories…
            </div>`
          : ''}
        ${this.repositories && !this.repositories.length
          ? html`<div
              class="le__list__item le__list__item--pad_small le__list__item--emphasis"
            >
              No repository access found.
            </div>`
          : ''}
      </div>
      <div class="onboarding__missing">
        <span class="material-icons">help_outline</span>
        <div>
          Repository missing?
          ${this.installation
            ? html`Configure the
                <a href=${this.installation?.url || APP_URL}>GitHub App</a>
                repository access.`
            : html`Install the <a href=${APP_URL}>GitHub App</a>.`}
        </div>
      </div>`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateWorkspaces(onboarding: ServiceOnboarding): TemplateResult {
    // When using popstate, the repository id can be different than the cached selection.
    if (
      this.workspaces &&
      this.workspacesId &&
      this.api.project !== this.workspacesId
    ) {
      this.workspaces = undefined;
    }

    if (!this.workspaces) {
      this.loadWorkspaces();
    }

    return html` <h2>
        Workspaces in ${this.api.organization}/${this.api.project}
      </h2>
      <div class="le__list">
        ${this.workspaces ? html`<p>Select a workspace:</p>` : ''}
        ${repeat(
          this.workspaces || [],
          workspace => workspace.name,
          workspace => {
            return html`<div
              class="le__list__item le__list__item--pad_small le__clickable"
              @click=${(evt: MouseEvent) => {
                // Links should already redirect.
                if ((evt.target as HTMLElement).tagName === 'A') {
                  return;
                }
                // Allow clicking off the link to also redirect.
                window.location.href = this.generateUrl(
                  this.api.organization,
                  this.api.project,
                  workspace.name
                );
              }}
            >
              <a
                href=${this.generateUrl(
                  this.api.organization,
                  this.api.project,
                  workspace.name
                )}
                >${workspace.name}</a
              >
            </div>`;
          }
        )}
        ${!this.workspaces
          ? html`<div class="le__list__item">
              ${templateLoading({padHorizontal: true})} Finding
              ${this.api.organization}/${this.api.project} workspaces…
            </div>`
          : ''}
        ${this.workspaces && !this.workspaces.length
          ? html`<div
              class="le__list__item le__list__item--pad_small le__list__item--emphasis"
            >
              Unable to find workspaces.
            </div>`
          : ''}
      </div>
      <div class="onboarding__missing">
        <span class="material-icons">info</span>
        <div>
          Workspaces are git branches that begin with
          <code>workspace/</code> or special branches like <code>main</code>,
          <code>staging</code>, or <code>master</code>.
        </div>
      </div>`;
  }
}
