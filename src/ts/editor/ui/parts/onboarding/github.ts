import {
  ApiError,
  GitHubInstallationInfo,
  GitHubOrgInstallationInfo,
  UserData,
  WorkspaceData,
} from '../../../api';
import {BasePart, UiPartComponent, UiPartConfig} from '..';
import {TemplateResult, classMap, html, repeat} from '@blinkk/selective-edit';
import {
  handleKeyboardNav,
  preventNormalLinks,
  templateLoading,
} from '../../../template';

import {EVENT_ONBOARDING_UPDATE} from '../../../events';
import {EditorState} from '../../../state';
import {GitHubApi} from '../../../../server/gh/githubApi';
import {OnboardingBreadcrumbs} from '../onboarding';
import TimeAgo from 'javascript-time-ago';
import {githubIcon} from '../../icons';
import {templateApiError} from '../../error';

const APP_URL = 'https://github.com/apps/editor-dev';
const BASE_URL = '/gh/';
const MIN_FILTER_LENGTH = 9;

export interface GitHubOnboardingPartConfig extends UiPartConfig {
  breadcrumbs: OnboardingBreadcrumbs;
  /**
   * State class for working with editor state.
   */
  state: EditorState;
}

export class GitHubOnboardingPart extends BasePart implements UiPartComponent {
  config: GitHubOnboardingPartConfig;
  error?: ApiError;
  organizations?: Array<GitHubInstallationInfo>;
  installation?: GitHubInstallationInfo;
  /**
   * Value to filter the list of results for.
   */
  listFilter?: string;
  repositories?: Array<GitHubOrgInstallationInfo>;
  /**
   * Track the id that was used to load the repositories.
   * Reset the loaded repositories when the id does not match.
   * ex: on pop state.
   */
  repositoriesId?: number;
  service = 'GitHub';
  timeAgo: TimeAgo;
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
    this.timeAgo = new TimeAgo('en-US');

    this.config.breadcrumbs.addBreadcrumb(
      {
        label: 'GitHub',
        handleClick: () => {
          this.api.organization = undefined;
          this.api.project = undefined;
          this.api.branch = undefined;
          this.render();
        },
      },
      0,
      true
    );

    if (!history.state) {
      // Update current state with onboarding flag.
      history.replaceState(
        Object.assign({}, history.state || {}, {
          onboarding: true,
        }),
        history.state?.title || document.title,
        window.location.pathname
      );
    }

    // Watch for the history popstate.
    window.addEventListener('popstate', this.handlePopstate.bind(this));
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

  handleFilterInput(evt: Event) {
    this.listFilter = (evt.target as HTMLInputElement).value;
    this.render();
  }

  handlePopstate(evt: PopStateEvent) {
    // When using popstate update the onboarding flow to the state values.
    if (evt.state && evt.state.onboarding === true) {
      this.api.organization = evt.state.organization || undefined;
      this.api.project = evt.state.repository || undefined;
      this.api.branch = evt.state.branch || undefined;
      this.error = undefined;
      this.config.state.checkOnboarding();
    }
  }

  loadWorkspaces() {
    // Load organization to show the current organization avatar.
    if (!this.organizations) {
      this.loadOrganizations();
    }

    if (this.error) {
      return;
    }

    this.api
      .getWorkspaces(this.api.organization, this.api.project)
      .then(workspaces => {
        this.workspaces = workspaces;
        this.workspacesId = this.api.project;
        this.render();
      })
      .catch(err => {
        err.json().then((json: any) => {
          this.error = json as ApiError;
          this.render();
        });

        console.error('Unable to retrieve the list of workspaces.', err);
      });
  }

  loadOrganizations() {
    this.api
      .getOrganizations()
      .then(organizations => {
        this.organizations = organizations;

        // Check if we already have an organization selected.
        if (this.api.organization) {
          for (const org of this.organizations) {
            if (org.org === this.api.organization) {
              this.installation = org;
            }
          }
        }

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

        // Sort the repositories by the last activity.
        this.repositories.sort((a, b) => {
          if (!a.updatedAt && !b.updatedAt) {
            return 0;
          }
          if (!a.updatedAt) {
            return -1;
          }
          if (!b.updatedAt) {
            return 1;
          }
          if (a.updatedAt < b.updatedAt) {
            return 1;
          } else if (a.updatedAt > b.updatedAt) {
            return -1;
          }
          return 0;
        });

        this.repositoriesId = this.installation?.id;
        this.render();
      })
      .catch(() => {
        console.error('Unable to retrieve the list of repositories.');
      });
  }

  template(): TemplateResult {
    const parts: Array<TemplateResult> = [];

    if (!this.api.checkAuth()) {
      parts.push(this.templateLogin());
    } else if (!this.api.organization) {
      parts.push(this.templateOrganizations());
    } else if (!this.api.project) {
      parts.push(this.templateRepositories());
    } else {
      parts.push(this.templateWorkspaces());
    }

    return html`<div class=${classMap(this.classesForPart())}>${parts}</div>`;
  }

  templateFilter(): TemplateResult {
    return html`<div class="le__part__onboarding__filter">
      <input
        type="text"
        @input=${this.handleFilterInput.bind(this)}
        placeholder="Filter…"
        value=${this.listFilter || ''}
      />
    </div>`;
  }

  templateHeader(title?: string): TemplateResult {
    return html`<div class="le__part__onboarding__header">
      <div class="le__part__onboarding__header__inner">
        <div class="le__part__onboarding__icon">
          ${this.installation?.avatarUrl
            ? html`<img
                src=${this.installation?.avatarUrl}
                alt=${this.installation?.org}
              />`
            : html`${githubIcon}`}
        </div>
        <h1>GitHub</h1>
        ${title ? html`<h2>${title}</h2>` : ''}
      </div>
    </div>`;
  }

  templateHelp(message: TemplateResult): TemplateResult {
    return html`<div class="le__part__onboarding__help">
      <span class="material-icons">help_outline</span>
      <div class="le__part__onboarding__help__message">${message}</div>
    </div>`;
  }

  templateLoadingStatus(message: TemplateResult): TemplateResult {
    return html`<div class="le__part__onboarding__loading">
      ${templateLoading({padHorizontal: true})} ${message}
    </div>`;
  }

  templateLogin(): TemplateResult {
    return html`${this.templateHeader()}
      <div class="le__part__onboarding__github__login">
        <p>Sign in to Github to start editing.</p>
        <div
          class="le__button le__button--primary le__button--no-wrap le__button--outline le__button--center"
          href="#"
          @click=${this.api.triggerAuth}
        >
          <div class="le__button__inner">
            ${githubIcon}
            <div>Login with GitHub</div>
          </div>
        </div>
      </div>`;
  }

  templateOrganizations(): TemplateResult {
    if (!this.organizations) {
      this.loadOrganizations();
    }

    this.config.breadcrumbs.addBreadcrumb(
      {
        label: 'Select an organization',
      },
      1,
      true
    );

    const useFilter = Boolean(
      this.organizations && this.organizations.length > MIN_FILTER_LENGTH
    );

    // Allow the filter input to filter the repositories.
    let filtered = this.organizations;
    if (
      this.organizations &&
      this.listFilter &&
      this.listFilter.trim() !== ''
    ) {
      filtered = this.organizations.filter(org =>
        org.org.includes(this.listFilter || '')
      );
    }

    return html` ${this.templateHeader()}
      ${this.templateSection('Select an organization')}
      <div class="le__part__onboarding__options">
        <div
          class=${classMap({
            le__list: true,
          })}
        >
          <div
            class=${classMap({
              le__list__item: true,
              'le__list__item--header': true,
              'le__list__item--pad': true,
            })}
          >
            <div class="le__list__item__title">
              ${useFilter ? this.templateFilter() : 'Organization'}
            </div>
          </div>
          ${this.organizations
            ? ''
            : this.templateLoadingStatus(html`Finding organizations…`)}
          ${repeat(
            filtered || [],
            org => org.id,
            org => {
              return html`<div
                class=${classMap({
                  le__list__item: true,
                  'le__list__item--pad': true,
                  'le__list__item--separator': true,
                  le__clickable: true,
                })}
                @click=${() => {
                  this.api.organization = org.org;
                  this.installation = org;
                  this.listFilter = undefined;
                  this.error = undefined;

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
                @keydown=${handleKeyboardNav.bind(this)}
                tabindex="0"
                role="button"
                aria-pressed="false"
              >
                <div class="le__list__item__avatar">
                  <a
                    href="${BASE_URL}${org.org}/"
                    @click=${preventNormalLinks}
                    tabindex="-1"
                    >${org.avatarUrl
                      ? html`<img src=${org.avatarUrl} alt=${org.org} />`
                      : html`${githubIcon}`}</a
                  >
                </div>
                <div class="le__list__item__title">
                  <a
                    href="${BASE_URL}${org.org}/"
                    @click=${preventNormalLinks}
                    tabindex="-1"
                    >${org.org}</a
                  >
                </div>
              </div>`;
            }
          )}
          ${this.organizations && !this.organizations.length
            ? html`<div
                class="le__grid__item le__grid__item--pad le__grid__item--emphasis"
              >
                No organization access found.
              </div>`
            : ''}
        </div>
        ${this.templateHelp(html`Unable to find your organization? Install the
          <a href=${APP_URL}>GitHub App</a>.`)}
      </div>`;
  }

  templateRecentRepositories(filter?: string, maxCount = 10): TemplateResult {
    let recentProjects = this.config.state.history.recentProjects;

    // Filter down all the recent to just ones that belong to the current
    // organization.
    if (filter) {
      recentProjects = recentProjects.filter(project =>
        project.identifier.startsWith(filter)
      );
    }

    // Adjust the number of recent projects to show.
    recentProjects = recentProjects.slice(0, maxCount);

    if (!recentProjects.length) {
      return html``;
    }

    return html`${this.templateSection('Recent repositories')}
      <div class="le__part__onboarding__options">
        <div
          class=${classMap({
            le__grid: true,
            'le__grid--col-3': true,
          })}
        >
          ${repeat(
            recentProjects,
            project => project.identifier,
            project => {
              return html`<div
                class=${classMap({
                  le__grid__item: true,
                  'le__grid__item--pad': true,
                  'le__grid__item--box': true,
                  'le__grid__item--box-centered': true,
                  le__clickable: true,
                })}
                @click=${() => {
                  const repository = project.identifier.replace(
                    `${this.api.organization}/`,
                    ''
                  );
                  this.api.project = repository;
                  this.listFilter = undefined;
                  this.error = undefined;

                  history.pushState(
                    {
                      onboarding: true,
                      organization: this.api.organization,
                      repository: repository,
                    },
                    repository,
                    this.generateUrl(this.api.organization, this.api.project)
                  );

                  this.render();
                  return false;
                }}
                @keydown=${handleKeyboardNav.bind(this)}
                tabindex="0"
                role="button"
                aria-pressed="false"
              >
                <div>
                  <a
                    href="${BASE_URL}${project.identifier}/"
                    @click=${preventNormalLinks}
                    tabindex="-1"
                    >${project.identifier}</a
                  >
                </div>
                <div class="le__part__onboarding__github__time">
                  Visited ${this.timeAgo.format(new Date(project.lastVisited))}
                </div>
              </div>`;
            }
          )}
        </div>
      </div>`;
  }

  templateRepositories(): TemplateResult {
    this.config.breadcrumbs.addBreadcrumb(
      {
        label:
          this.api.organization || this.installation?.org || 'Organization',
        handleClick: () => {
          this.api.project = undefined;
          this.api.branch = undefined;
          this.render();
        },
      },
      1
    );
    this.config.breadcrumbs.addBreadcrumb(
      {
        label: 'Select a project',
      },
      2,
      true
    );

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

    const useFilter = Boolean(
      this.repositories && this.repositories.length > MIN_FILTER_LENGTH
    );

    // Allow the filter input to filter the repositories.
    let filtered = this.repositories;
    if (this.repositories && this.listFilter && this.listFilter.trim() !== '') {
      filtered = this.repositories.filter(repo =>
        repo.repo.includes(this.listFilter || '')
      );
    }

    // ${this.templateRecentRepositories(`${this.api.organization}/`, 3)}

    return html`${this.templateHeader()}
      ${this.templateSection(html`Repositories in ${this.api.organization}`)}
      <div class="le__part__onboarding__options">
        <div
          class=${classMap({
            le__list: true,
          })}
        >
          <div
            class=${classMap({
              le__list__item: true,
              'le__list__item--header': true,
              'le__list__item--pad': true,
            })}
          >
            <div class="le__list__item__title">
              ${useFilter ? this.templateFilter() : 'Repository'}
            </div>
            <div class="le__list__item__data">Last updated</div>
          </div>
          ${this.repositories
            ? ''
            : this.templateLoadingStatus(html`Finding ${this.api.organization}
              repositories…`)}
          ${repeat(
            filtered || [],
            repo => repo.repo,
            repo => {
              const handleClick = () => {
                this.api.project = repo.repo;
                this.listFilter = undefined;
                this.error = undefined;

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
              };

              return html`<div
                class=${classMap({
                  le__list__item: true,
                  'le__list__item--pad': true,
                  'le__list__item--separator': true,
                  le__clickable: true,
                })}
                @click=${handleClick}
                @keydown=${handleKeyboardNav.bind(this)}
                tabindex="0"
                role="button"
                aria-pressed="false"
              >
                <div
                  class="le__list__item__title le__list__item__title--no-avatar"
                >
                  <a
                    href="${BASE_URL}${repo.org}/${repo.repo}/"
                    @click=${preventNormalLinks}
                    tabindex="-1"
                    >${repo.org}/${repo.repo}</a
                  >
                </div>
                ${repo.updatedAt
                  ? html`<div class="le__list__item__data">
                      Updated ${this.timeAgo.format(new Date(repo.updatedAt))}
                    </div>`
                  : ''}
              </div>`;
            }
          )}
          ${this.repositories && !this.repositories.length
            ? html`<div
                class="le__grid__item le__grid__item--pad le__grid__item--emphasis"
              >
                No repository access found.
              </div>`
            : ''}
        </div>
        ${this.templateHelp(html`Repository missing?
        ${this.installation
          ? html`Configure the
              <a href=${this.installation?.url || APP_URL}>GitHub App</a>
              repository access.`
          : html`Install the <a href=${APP_URL}>GitHub App</a>.`}`)}
      </div>`;
  }

  templateSection(
    title?: string | TemplateResult,
    description?: string
  ): TemplateResult {
    return html`<div class="le__part__onboarding__section">
      ${title ? html`<h4>${title}</h4>` : ''}
      ${description ? html`<p>${description}</p>` : ''}
    </div>`;
  }

  templateWorkspaces(): TemplateResult {
    this.config.breadcrumbs.addBreadcrumb(
      {
        label:
          this.api.organization || this.installation?.org || 'Organization',
        handleClick: () => {
          this.api.project = undefined;
          this.api.branch = undefined;
          this.render();
        },
      },
      1
    );
    this.config.breadcrumbs.addBreadcrumb(
      {
        label: this.api.project || '',
        handleClick: () => {
          this.api.branch = undefined;
          this.render();
        },
      },
      2
    );
    this.config.breadcrumbs.addBreadcrumb(
      {
        label: 'Select a workspace',
      },
      3,
      true
    );

    // When using popstate, the repository id can be different than the cached selection.
    if (
      this.workspaces &&
      this.workspacesId &&
      this.api.project !== this.workspacesId
    ) {
      this.workspaces = undefined;
    }

    const useFilter = Boolean(
      this.workspaces && this.workspaces.length > MIN_FILTER_LENGTH
    );

    if (!this.workspaces) {
      this.loadWorkspaces();
    }

    // Allow the filter input to filter the repositories.
    let filtered = this.workspaces;
    if (this.workspaces && this.listFilter && this.listFilter.trim() !== '') {
      filtered = this.workspaces.filter(workspace =>
        workspace.name.includes(this.listFilter || '')
      );
    }

    return html`${this.templateHeader()}
      ${this.templateSection(
        `Select a workspace from ${this.api.organization}/${this.api.project}`
      )}
      <div class="le__part__onboarding__options">
        <div
          class=${classMap({
            le__list: true,
          })}
        >
          <div
            class=${classMap({
              le__list__item: true,
              'le__list__item--header': true,
              'le__list__item--pad': true,
            })}
          >
            <div class="le__list__item__title">
              ${useFilter ? this.templateFilter() : 'Workspace'}
            </div>
          </div>
          ${this.error ? templateApiError(this.error, {pad: true}) : ''}
          ${this.workspaces || this.error
            ? ''
            : this.templateLoadingStatus(html`Finding
              ${this.api.organization}/${this.api.project} workspaces…`)}
          ${repeat(
            filtered || [],
            workspace => workspace.name,
            workspace => {
              return html`<div
                class=${classMap({
                  le__list__item: true,
                  'le__list__item--pad': true,
                  'le__list__item--separator': true,
                  le__clickable: true,
                })}
                @click=${() => {
                  this.api.branch = workspace.name;
                  this.error = undefined;

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
                @keydown=${handleKeyboardNav.bind(this)}
                tabindex="0"
                role="button"
                aria-pressed="false"
              >
                <div
                  class="le__list__item__title le__list__item__title--no-avatar"
                >
                  <a
                    href=${this.generateUrl(
                      this.api.organization,
                      this.api.project,
                      workspace.name
                    )}
                    @click=${preventNormalLinks}
                    tabindex="-1"
                    >${workspace.name}</a
                  >
                </div>
              </div>`;
            }
          )}
          ${this.workspaces && !this.workspaces.length
            ? html`<div
                class="le__grid__item le__grid__item--pad le__grid__item--emphasis"
              >
                Unable to find workspaces.
              </div>`
            : ''}
        </div>
        ${this.templateHelp(html`Workspaces are git branches that begin with
          <code>workspace/</code> or special branches like <code>main</code>,
          <code>staging</code>, or <code>master</code>.`)}
      </div>`;
  }
}
