import {BasePart, UiPartComponent, UiPartConfig} from '.';
import {EditorState, StatePromiseKeys} from '../../state';
import {
  ProjectHistory,
  RecentFileData,
  RecentWorkspaceData,
} from '../../recent';
import {TemplateResult, classMap, html, repeat} from '@blinkk/selective-edit';

import {DataStorage} from '../../../utility/dataStorage';
import {EVENT_FILE_LOAD} from '../../events';
import {ProjectSource} from '../../api';
import TimeAgo from 'javascript-time-ago';

export const STORAGE_RECENT = 'live.dashboard.recent';

export interface DashboardPartConfig extends UiPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  /**
   * Storage class for working with settings.
   */
  storage: DataStorage;
}

// TODO: Refactor recent into the State.
export interface DashboardRecent {
  /**
   * Recently opened workspaces.
   */
  workspaces?: Record<string, Array<string>>;
}

export class DashboardPart extends BasePart implements UiPartComponent {
  config: DashboardPartConfig;
  projectHistory?: ProjectHistory;
  timeAgo: TimeAgo;

  constructor(config: DashboardPartConfig) {
    super();
    this.config = config;
    this.timeAgo = new TimeAgo('en-US');
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__panel: true,
      le__part__dashboard: true,
      'le__part__dashboard--loading': this.config.state.inProgress(
        StatePromiseKeys.GetFile
      ),
    };
  }

  template(): TemplateResult {
    if (!this.projectHistory && this.config.state.projectId) {
      this.projectHistory = this.config.state.history.getProject(
        this.config.state.projectId
      );
    }

    const subParts: Array<TemplateResult> = [];

    subParts.push(this.templateFileNotFound());
    subParts.push(this.templateRecentFiles());
    subParts.push(this.templateRecentWorkspaces());

    return html`<div class=${classMap(this.classesForPart())}>
      ${subParts}
    </div>`;
  }

  templateFileNotFound(): TemplateResult {
    if (this.config.editor.state.file !== null) {
      return html``;
    }

    const message = this.config.editor.state.loadingFilePath
      ? html`Unable to load the file:
          <code>${this.config.editor.state.loadingFilePath}</code>`
      : 'Unable to load the file, it was not found.';
    return html` <div class="le__part__dashboard__not_found">
      <div><span class="material-icons">warning</span></div>
      <div>${message}</div>
    </div>`;
  }

  templateFileParts(path: string): TemplateResult {
    const parts = path.split('/').slice(1);
    const pathFile = parts[parts.length - 1].split('.').slice(0, -1).join('.');
    const pathParts = parts.slice(0, -1);

    return html`<div>${pathFile}</div>
      <div class="le__part__dashboard__aside le__part__dashboard__branch">
        ${repeat(
          pathParts,
          i => i,
          (value, index) =>
            html`${index > 0
              ? html`<span class="material-icons">arrow_right</span>`
              : ''}
            ${value}`
        )}
      </div>`;
  }

  templateRecentFiles(): TemplateResult {
    const subParts: Array<TemplateResult> = [];
    let recentFiles: Array<RecentFileData> = [];

    const workspace = this.config.state.workspaceOrGetWorkspace();
    if (this.projectHistory && workspace) {
      recentFiles = this.projectHistory.getRecentFiles(workspace.name);
    }

    if (recentFiles.length) {
      subParts.push(html`<div class="le__part__dashboard__recent">
        <h2>Recent files</h2>
        <p>
          Select a file from the menu to begin editing or choose from the recent
          files:
        </p>
        <div class="le__list">
          ${repeat(
            recentFiles,
            recentFile => recentFile.path,
            recentFile => {
              return html`<div
                class=${classMap({
                  le__list__item: true,
                  'le__list__item--pad_small': true,
                  'le__list__item--column': true,
                  le__clickable: true,
                })}
                @click=${() => {
                  document.dispatchEvent(
                    new CustomEvent(EVENT_FILE_LOAD, {
                      detail: {
                        path: recentFile.path,
                      },
                    })
                  );
                }}
              >
                ${this.templateFileParts(recentFile.path)}
              </div>`;
            }
          )}
        </div>
      </div>`);
    } else {
      subParts.push(html`<p>Select a file from the menu to begin editing.</p>`);
    }
    return html`${subParts}`;
  }

  templateRecentWorkspaces(): TemplateResult {
    const subParts: Array<TemplateResult> = [];
    let recentWorkspaces: Array<RecentWorkspaceData> = [];

    const workspace = this.config.state.workspaceOrGetWorkspace();
    if (
      // Local projects do not provide workspace support.
      this.config.state.project?.source?.source !== ProjectSource.Local &&
      this.projectHistory &&
      workspace
    ) {
      recentWorkspaces = this.projectHistory.getRecentWorkspaces();
    }

    if (recentWorkspaces.length > 1) {
      subParts.push(html`<div class="le__part__dashboard__recent">
        <h2>Recent Workspaces</h2>
        <div class="le__grid le__grid--3-2 le__grid--col-4">
          ${repeat(
            recentWorkspaces,
            workspace => workspace.name,
            workspace => {
              return html`<div
                class=${classMap({
                  le__grid__item: true,
                  'le__grid__item--box': true,
                  'le__grid__item--box-centered': true,
                  'le__grid__item--pad_small': true,
                  'le__grid__item--selected':
                    this.config.state.workspace?.name === workspace.name,
                  le__clickable: true,
                })}
                @click=${() => {
                  // TODO: Load workspaces if not loaded yet.
                  for (const workspaceInfo of this.config.state.workspaces ||
                    []) {
                    if (workspaceInfo.name === workspace.name) {
                      this.config.state.loadWorkspace(workspaceInfo);
                    }
                  }
                }}
              >
                <div>${workspace.name}</div>
                ${this.config.state.workspace?.name === workspace.name
                  ? html`<div class="le__part__dashboard__aside">
                      (current workspace)
                    </div>`
                  : html`<div class="le__part__onboarding__github__time">
                      Visited
                      ${this.timeAgo.format(new Date(workspace.lastVisited))}
                    </div>`}
              </div>`;
            }
          )}
        </div>
      </div>`);
    }
    return html`${subParts}`;
  }
}
