import {BasePart, Part} from '.';
import {EditorState, StatePromiseKeys} from '../state';
import {TemplateResult, classMap, html, repeat} from '@blinkk/selective-edit';

import {DataStorage} from '../../utility/dataStorage';
import {EditorFileData} from '../api';
import {LiveEditor} from '../editor';
import {templateLoading} from '../template';
import {EVENT_FILE_LOAD} from '../events';

const STORAGE_RECENT = 'live.empty.recent';
const RECENT_MAX_COUNT = 10;

export interface EmptyPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  /**
   * Storage class for working with settings.
   */
  storage: DataStorage;
}

export class EmptyPart extends BasePart implements Part {
  config: EmptyPartConfig;
  recentFilePaths: Array<string>;

  constructor(config: EmptyPartConfig) {
    super();
    this.config = config;
    this.recentFilePaths =
      this.config.storage.getItemArray(STORAGE_RECENT) || [];

    // Watch for loaded files and add them to recent files.
    this.config.state.addListener(
      StatePromiseKeys.GetFile,
      (file: EditorFileData | undefined) => {
        if (!file || !file.file.path) {
          return;
        }

        if (this.recentFilePaths.includes(file.file.path)) {
          // Already in recent files, shift to the beggining of the list.
          const index = this.recentFilePaths.indexOf(file.file.path);

          if (index > 0) {
            this.recentFilePaths = [
              file.file.path,
              ...this.recentFilePaths.slice(0, index),
              ...this.recentFilePaths.slice(index + 1),
            ];
          }
        } else {
          // Add newest file to the beginning of the path.
          this.recentFilePaths.unshift(file.file.path);

          // Trim old file paths.
          this.recentFilePaths = this.recentFilePaths.slice(
            0,
            RECENT_MAX_COUNT - 1
          );
        }
        this.config.storage.setItemArray(STORAGE_RECENT, this.recentFilePaths);
      }
    );
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__empty: true,
      'le__part__empty--loading': this.config.state.inProgress(
        StatePromiseKeys.GetFile
      ),
    };
  }

  template(editor: LiveEditor): TemplateResult {
    const subParts: Array<TemplateResult> = [];
    if (editor.state.inProgress(StatePromiseKeys.GetFile)) {
      subParts.push(html`<div class="le__part__empty__loading">
        ${templateLoading()} Loading
        <code>${editor.state.loadingFilePath || 'file'}</code>...
      </div>`);
    } else {
      subParts.push(this.templateRecentFiles(editor));
    }
    return html`<div class=${classMap(this.classesForPart())}>
      ${subParts}
    </div>`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateRecentFiles(editor: LiveEditor): TemplateResult {
    const subParts: Array<TemplateResult> = [];
    if (this.recentFilePaths.length) {
      subParts.push(html`<div class="le__part__empty__recent">
        <h2>Recent files</h2>
        <div class="le__list">
          ${repeat(
            this.recentFilePaths,
            path => path,
            path => {
              return html`<div
                class=${classMap({
                  le__list__item: true,
                  'le__list__item--pad': true,
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
                ${path}
              </div>`;
            }
          )}
        </div>
      </div>`);

      subParts.push(
        html`<p>Or select a file from the menu to begin editing.</p>`
      );
    } else {
      subParts.push(html`<p>Select a file from the menu to begin editing.</p>`);
    }
    return html`<div class=${classMap(this.classesForPart())}>
      ${subParts}
    </div>`;
  }
}
