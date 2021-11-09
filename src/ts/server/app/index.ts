import {DataStorage, LocalDataStorage} from '../../utility/dataStorage';
import {
  TemplateResult,
  classMap,
  html,
  render,
  repeat,
} from '@blinkk/selective-edit';
import {
  getBaseUrlForSource,
  handleKeyboardNav,
  preventNormalLinks,
} from '../../editor/template';
import {githubIcon, localIcon} from '../../editor/ui/icons';

import {EditorAppComponent} from './editorApp';
import {EditorHistory} from '../../editor/recent';
import {GitHubEditorApp} from './githubApp';
import {LocalEditorApp} from './localApp';
import TimeAgo from 'javascript-time-ago';

/**
 * The editor needs to determine a few things before it can start display.
 *
 * This shell is created to search for predefined information in the html
 * that can help the editor correctly start rendering the app.
 *
 * If unable to determine the connector the app shell will show the start UI
 * which allows the user to choose one of the avaible connectors to start using.
 */
export class EditorAppShell {
  container: HTMLElement;
  editorApp?: EditorAppComponent;
  /**
   * Editor history.
   */
  history: EditorHistory;
  storage: DataStorage;
  timeAgo: TimeAgo;

  constructor(container: HTMLElement) {
    this.container = container;
    this.storage = new LocalDataStorage();
    this.history = new EditorHistory({
      storage: this.storage,
    });
    this.timeAgo = new TimeAgo('en-US');
  }

  init() {
    // Check for a local editor project.
    const localPort = parseInt(this.container.dataset.port || '');
    const isLocal = localPort > 0;

    if (isLocal) {
      this.editorApp = new LocalEditorApp(this.container, {
        port: localPort,
      });
    } else {
      // Check for a service based connector.
      const service = this.container.dataset.service;

      if (service === 'gh') {
        this.editorApp = new GitHubEditorApp(this.container);
      }
    }

    if (this.editorApp) {
      // Determined what app to use, initialize it.
      this.editorApp.init();
    } else {
      // Unable to determine which kind of app to use.
      // Will instead show UI for choosing the connector.
      this.render();
    }
  }

  render() {
    render(this.template(), this.container);
  }

  /**
   * Template that is rendered for the app.
   *
   * This template is 'root' template for the entire app UI.
   * In other words, the entire app UI structure starts from
   * this template.
   */
  template(): TemplateResult {
    return html`<div class="le">
      <div class="le__panel le__part__onboarding">
        <div class="le__panel le__part__onboarding__toolbar">
          <div class="le__part__onboarding__breadcrumb">
            <div class="le__part__onboarding__toolbar__title">
              <a href="/start/">Editor.dev</a>
            </div>
            <div class="le__part__onboarding__breadcrumb__item">
              Choose a connector
            </div>
          </div>
        </div>
        <div class="le__part__onboarding__header">
          <div class="le__part__onboarding__header__inner">
            <h1>Start editing</h1>
          </div>
        </div>
        ${this.templateConnectors()} ${this.templateRecentRepositories()}
      </div>
    </div>`;
  }

  templateConnectors(): TemplateResult {
    const connectorOptions = [
      {
        title: 'Local',
        label: 'Edit a local project for development and testing.',
        icon: localIcon,
        handleClick: () => {
          window.location.href = '/local/';
        },
      },
      {
        title: 'GitHub',
        label: 'Edit a project hosted on GitHub.',
        icon: githubIcon,
        handleClick: () => {
          window.location.href = '/gh/';
        },
      },
    ];

    return html`<div class="le__part__onboarding__generic">
      <div class="le__part__onboarding__section">
        Choose a connector to start editing a project.
      </div>
      <div class="le__part__onboarding__options">
        <div class="le__grid le__grid--col-2">
          ${repeat(
            connectorOptions,
            connectorOption => connectorOption.title,
            connectorOption => {
              return html`<div
                class="le__grid__item le__grid__item--pad le__grid__item--box le__clickable"
                @click=${connectorOption.handleClick}
              >
                <div class="le__part__onboarding__generic__icon">
                  ${connectorOption.icon}
                </div>
                <div class="le__part__onboarding__generic__title">
                  ${connectorOption.title}
                </div>
                <div class="le__part__onboarding__generic__label">
                  ${connectorOption.label}
                </div>
              </div>`;
            }
          )}
        </div>
      </div>
    </div>`;
  }

  templateRecentRepositories(maxCount = 10): TemplateResult {
    let recentProjects = this.history.recentProjects;

    // Adjust the number of recent projects to show.
    recentProjects = recentProjects.slice(0, maxCount);

    if (!recentProjects.length) {
      return html``;
    }

    return html`<div class="le__part__onboarding__options">
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
          <div class="le__list__item__title">Recent project</div>
          <div class="le__list__item__data">Last visited</div>
        </div>
        ${repeat(
          recentProjects,
          project => project.identifier,
          project => {
            return html`<div
              class=${classMap({
                le__list__item: true,
                'le__list__item--pad': true,
                'le__list__item--separator': true,
                le__clickable: true,
              })}
              @click=${() => {
                window.location.href = `${getBaseUrlForSource(project.source)}${
                  project.identifier
                }/`;
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
                  href="${getBaseUrlForSource(
                    project.source
                  )}${project.identifier}/"
                  @click=${preventNormalLinks}
                  tabindex="-1"
                  >${project.identifier}</a
                >
              </div>
              <div class="le__list__item__data">
                Visited ${this.timeAgo.format(new Date(project.lastVisited))}
              </div>
            </div>`;
          }
        )}
      </div>
    </div>`;
  }
}
