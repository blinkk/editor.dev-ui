import {BasePart, UiPartComponent, UiPartConfig} from '..';
import {
  GitHubInstallationInfo,
  GitHubOrgInstallationInfo,
  ProjectData,
  UserData,
  WorkspaceData,
} from '../../../api';
import {TemplateResult, classMap, html, repeat} from '@blinkk/selective-edit';

import {EVENT_ONBOARDING_UPDATE} from '../../../events';
import {EditorState} from '../../../state';
import {GitHubApi} from '../../../../server/gh/githubApi';
import {templateLoading} from '../../../template';

const APP_URL = 'https://github.com/apps/editor-dev';
const BASE_URL = '/gh/';

export interface GitHubOnboardingPartConfig extends UiPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
}

export class GitHubOnboardingPart extends BasePart implements UiPartComponent {
  config: GitHubOnboardingPartConfig;
  organizations?: Array<GitHubInstallationInfo>;
  installation?: GitHubInstallationInfo;
  repositories?: Array<GitHubOrgInstallationInfo>;
  /**
   * Track the id that was used to load the repositories.
   * Reset the loaded repositories when the id does not match.
   * ex: on pop state.
   */
  repositoriesId?: number;
  service = 'GitHub';
  users?: Array<UserData>;
  workspaces?: Array<WorkspaceData>;
  /**
   * Track the id that was used to load the workspaces.
   * Reset the loaded workspaces when the id does not match.
   * ex: on pop state.
   */
  workspacesId?: string;

  constructor(config: GitHubOnboardingPartConfig) {
    super();
    this.config = config;
  }

  get api(): GitHubApi {
    return this.config.editor.api as GitHubApi;
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__onboarding__github: true,
    };
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

  loadProject() {
    this.users = this.config.state.getProject((project: ProjectData) => {
      // Default to array so it does not try to keep reloading the project data.
      this.users = project.users || [];
      this.render();
    })?.users;
  }

  template(): TemplateResult {
    const parts: Array<TemplateResult> = [];

    if (!this.api.checkAuth()) {
      parts.push(this.templateLogin());
    }

    // Determine which part of the onboarding is missing.
    if (!this.api.organization) {
      parts.push(this.templateOrganizations());
    } else if (!this.api.project) {
      parts.push(this.templateRepositories());
    } else {
      parts.push(this.templateWorkspaces());
    }

    return html`<div class=${classMap(this.classesForPart())}>${parts}</div>`;
  }

  templateLogin(): TemplateResult {
    return html`<div class="le__part__onboarding__github__login">
      <button
        class="le__button le__button--primary"
        href="#"
        @click=${this.api.triggerAuth}
      >
        Login to GitHub
      </button>
    </div>`;
  }

  templateOrganizations(): TemplateResult {
    if (!this.organizations) {
      this.loadOrganizations();
    }

    return html`<div class="le__part__onboarding__github__header">
        <h2>Organizations</h2>
        <div class="le__part__onboarding__github__selection">
          ${this.organizations
            ? html`Select an organization`
            : html`${templateLoading({padHorizontal: true, size: 'small'})}
              Finding organizations…`}
        </div>
      </div>
      <div class="le__part__onboarding__github__options">
        <div class="le__grid le__grid--col-4 le__grid--3-2">
          ${repeat(
            this.organizations || [],
            org => org.id,
            org => {
              return html`<div
                class="le__grid__item le__grid__item--pad_small le__grid__item--box le__grid__item--box-centered le__clickable"
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
          ${this.organizations && !this.organizations.length
            ? html`<div
                class="le__grid__item le__grid__item--pad_small le__grid__item--emphasis"
              >
                No organization access found.
              </div>`
            : ''}
        </div>
      </div>
      <div class="le__part__onboarding__help">
        <span class="material-icons">help_outline</span>
        <div class="le__part__onboarding__help__message">
          Unable to find your organization? Install the
          <a href=${APP_URL}>GitHub App</a>.
        </div>
      </div>`;
  }

  templateRepositories(): TemplateResult {
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

    return html`<div class="le__part__onboarding__github__header">
        <h2>Repositories in ${this.api.organization}</h2>
        <div class="le__part__onboarding__github__selection">
          ${this.repositories
            ? html`Select a repository`
            : html`${templateLoading({padHorizontal: true, size: 'small'})}
              Finding ${this.api.organization} repositories…`}
        </div>
      </div>
      <div class="le__part__onboarding__github__options">
        <div class="le__grid le__grid--col-4 le__grid--3-2">
          ${repeat(
            this.repositories || [],
            repo => repo.repo,
            repo => {
              return html`<div
                class="le__grid__item le__grid__item--pad_small le__grid__item--box le__grid__item--box-centered le__clickable"
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
          ${this.repositories && !this.repositories.length
            ? html`<div
                class="le__grid__item le__grid__item--pad_small le__grid__item--emphasis"
              >
                No repository access found.
              </div>`
            : ''}
        </div>
      </div>
      <div class="le__part__onboarding__help">
        <span class="material-icons">help_outline</span>
        <div class="le__part__onboarding__help__message">
          Repository missing?
          ${this.installation
            ? html`Configure the
                <a href=${this.installation?.url || APP_URL}>GitHub App</a>
                repository access.`
            : html`Install the <a href=${APP_URL}>GitHub App</a>.`}
        </div>
      </div>`;
  }

  templateWorkspaces(): TemplateResult {
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

    return html`<div class="le__part__onboarding__github__header">
        <h2>Workspaces in ${this.api.organization}/${this.api.project}</h2>
        <div class="le__part__onboarding__github__selection">
          ${
            this.workspaces
              ? html`Select a workspace`
              : html`${templateLoading({padHorizontal: true, size: 'small'})}
                Finding ${this.api.organization}/${this.api.project} workspaces…`
          }
        </div>
      </div>
      <div class="le__part__onboarding__github__options">
        <div class="le__grid le__grid--col-4 le__grid--3-2">
          ${repeat(
            this.workspaces || [],
            workspace => workspace.name,
            workspace => {
              return html`<div
                class="le__grid__item le__grid__item--pad_small le__grid__item--box le__grid__item--box-centered le__clickable"
                @click=${() => {
                  this.api.branch = workspace.name;

                  history.pushState(
                    {
                      onboarding: true,
                      organization: this.api.organization,
                      repository: this.api.project,
                      branch: this.api.branch,
                    },
                    workspace.name,
                    this.generateUrl(
                      this.api.organization,
                      this.api.project,
                      this.api.branch
                    )
                  );

                  // Reload the onboarding info. Should have all of the required
                  // onboarding information.
                  document.dispatchEvent(
                    new CustomEvent(EVENT_ONBOARDING_UPDATE)
                  );
                  return false;
                }}
              >
                <a
                  href=${this.generateUrl(
                    this.api.organization,
                    this.api.project,
                    workspace.name
                  )}
                  @click=${preventNormalLinks}
                  >${workspace.name}</a
                >
              </div>`;
            }
          )}
          ${
            this.workspaces && !this.workspaces.length
              ? html`<div
                  class="le__grid__item le__grid__item--pad_small le__grid__item--emphasis"
                >
                  Unable to find workspaces.
                </div>`
              : ''
          }
        </div>
      </div>
      <div class="le__part__onboarding__help">
        <span class="material-icons">info</span>
        <div class="le__part__onboarding__help__message">
          Workspaces are git branches that begin with
          <code>workspace/</code> or special branches like <code>main</code>,
          <code>staging</code>, or <code>master</code>.
        </div>
      </div>
    </div>`;
  }
}

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
