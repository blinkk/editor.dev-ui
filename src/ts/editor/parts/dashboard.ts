import {BasePart, Part} from '.';
import {EditorFileData, WorkspaceData} from '../api';
import {EditorState, StatePromiseKeys} from '../state';
import {TemplateResult, classMap, html, repeat} from '@blinkk/selective-edit';

import {DataStorage} from '../../utility/dataStorage';
import {EVENT_FILE_LOAD} from '../events';
import {LiveEditor} from '../editor';

const STORAGE_RECENT = 'live.dashboard.recent';
const RECENT_MAX_COUNT = 8;

export interface DashboardPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  /**
   * Storage class for working with settings.
   */
  storage: DataStorage;
}

export interface DashboardRecent {
  /**
   * Recently opened files.
   */
  files?: Record<string, Array<string>>;
  /**
   * Recently opened workspaces.
   */
  workspaces?: Record<string, Array<string>>;
}

export class DashboardPart extends BasePart implements Part {
  config: DashboardPartConfig;
  recent: DashboardRecent;

  constructor(config: DashboardPartConfig) {
    super();
    this.config = config;
    this.recent = this.config.storage.getItemRecord(STORAGE_RECENT) || {};
    this.recent.files = this.recent.files ?? {};
    this.recent.workspaces = this.recent.workspaces ?? {};

    // Watch for loaded files and add them to recent files.
    this.config.state.addListener(
      StatePromiseKeys.GetFile,
      (file: EditorFileData | undefined) => {
        if (!file || !file.file.path) {
          return;
        }
        if (this.config.state.workspace) {
          this.updateRecentFile(file.file.path);
        } else {
          this.config.state.getWorkspace(() => {
            this.updateRecentFile(file.file.path);
          });
        }
      }
    );

    // Watch for loaded workspaces and add them to recent files.
    this.config.state.addListener(
      StatePromiseKeys.GetWorkspace,
      (workspace: WorkspaceData | undefined) => {
        if (!workspace || !workspace.name) {
          return;
        }
        if (this.config.state.project) {
          this.updateRecentWorkspace(workspace.name);
        } else {
          this.config.state.getProject(() => {
            this.updateRecentWorkspace(workspace.name);
          });
        }
      }
    );
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__dashboard: true,
      'le__part__dashboard--loading': this.config.state.inProgress(
        StatePromiseKeys.GetFile
      ),
    };
  }

  get recentFiles(): Array<string> {
    return (this.recent.files || {})[this.workspaceId] || [];
  }

  set recentFiles(value: Array<string>) {
    this.recent.files = this.recent.files ?? {};
    this.recent.files[this.workspaceId] = value;
  }

  get recentWorkspaces(): Array<string> {
    return (this.recent.workspaces || {})[this.projectId] || [];
  }

  set recentWorkspaces(value: Array<string>) {
    this.recent.workspaces = this.recent.workspaces ?? {};
    this.recent.workspaces[this.projectId] = value;
  }

  get projectId(): string {
    return `${this.config.state.project?.title}`;
  }

  get workspaceId(): string {
    return `${this.projectId}-${this.config.state.workspace?.branch.name}`;
  }

  template(editor: LiveEditor): TemplateResult {
    const subParts: Array<TemplateResult> = [];

    subParts.push(this.templateFileNotFound(editor));
    subParts.push(this.templateRecentFiles(editor));
    subParts.push(this.templateRecentWorkspaces(editor));

    return html`<div class=${classMap(this.classesForPart())}>
      ${subParts}
    </div>`;
  }

  templateFileNotFound(editor: LiveEditor): TemplateResult {
    if (editor.state.file !== null) {
      return html``;
    }

    const message = editor.state.loadingFilePath
      ? html`Unable to load the file:
          <code>${editor.state.loadingFilePath}</code>`
      : 'Unable to load the file, it was not found.';
    return html` <div class="le__part__dashboard__not_found">
      <div><span class="material-icons">warning</span></div>
      <div>${message}</div>
    </div>`;
  }

  templateFileParts(editor: LiveEditor, path: string): TemplateResult {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateRecentFiles(editor: LiveEditor): TemplateResult {
    const subParts: Array<TemplateResult> = [];

    if (this.recentFiles.length) {
      subParts.push(html`<div class="le__part__dashboard__recent">
        <h2>Recent files</h2>
        <p>
          Select a file from the menu to begin editing or choose from the recent
          files:
        </p>
        <div class="le__list">
          ${repeat(
            this.recentFiles,
            path => path,
            path => {
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
                        path: path,
                      },
                    })
                  );
                }}
              >
                ${this.templateFileParts(editor, path)}
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateRecentWorkspaces(editor: LiveEditor): TemplateResult {
    const subParts: Array<TemplateResult> = [];
    if (this.recentWorkspaces.length > 1) {
      subParts.push(html`<div class="le__part__dashboard__recent">
        <h2>Recent Workspaces</h2>
        <div class="le__grid le__grid--3-2 le__grid--col-4">
          ${repeat(
            this.recentWorkspaces,
            workspace => workspace,
            workspace => {
              return html`<div
                class=${classMap({
                  le__grid__item: true,
                  'le__grid__item--box': true,
                  'le__grid__item--box-centered': true,
                  'le__grid__item--pad_small': true,
                  'le__grid__item--selected':
                    this.config.state.workspace?.name === workspace,
                  le__clickable: true,
                })}
                @click=${() => {
                  // TODO: Load workspaces if not loaded yet.
                  for (const workspaceInfo of this.config.state.workspaces ||
                    []) {
                    if (workspaceInfo.name === workspace) {
                      this.config.state.loadWorkspace(workspaceInfo);
                    }
                  }
                }}
              >
                <div>${workspace}</div>
                ${this.config.state.workspace?.name === workspace
                  ? html`<div class="le__part__dashboard__aside">
                      (current workspace)
                    </div>`
                  : ''}
              </div>`;
            }
          )}
        </div>
      </div>`);
    }
    return html`${subParts}`;
  }

  updateRecentFile(path: string) {
    this.recentFiles = updateRecentList(this.recentFiles, path);
    this.config.storage.setItemRecord(STORAGE_RECENT, this.recent);
    this.render();
  }

  updateRecentWorkspace(workspace: string) {
    this.recentWorkspaces = updateRecentList(this.recentWorkspaces, workspace);
    this.config.storage.setItemRecord(STORAGE_RECENT, this.recent);
    this.render();
  }
}

function updateRecentList(list: Array<string>, value: string): Array<string> {
  if (list.includes(value)) {
    // Already in recent, shift to the beginning of the list.
    const index = list.indexOf(value);
    if (index > 0) {
      list = [value, ...list.slice(0, index), ...list.slice(index + 1)];
    }
  } else {
    // Add newest file to the beginning of the path.
    list.unshift(value);

    // Trim old values.
    list = list.slice(0, RECENT_MAX_COUNT - 1) || [];
  }
  return list;
}
