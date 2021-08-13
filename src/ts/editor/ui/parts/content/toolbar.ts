import {BasePart, UiPartComponent, UiPartConfig} from '..';
import {TemplateResult, classMap, html, repeat} from '@blinkk/selective-edit';
import {UrlConfig, UrlLevel} from '../../../api';

import {DataStorage} from '../../../../utility/dataStorage';
import {EVENT_REFRESH_FILE} from '../../../events';
import {EditorState} from '../../../state';
import {findPreviewValue} from '@blinkk/selective-edit/dist/utility/preview';

const STORAGE_EXPANDED_KEY = 'live.content.isExpanded';

export interface ContentToolbarConfig extends UiPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  /**
   * Storage class for working with settings.
   */
  storage: DataStorage;
}

export class ContentToolbarPart extends BasePart implements UiPartComponent {
  config: ContentToolbarConfig;
  isExpanded?: boolean;

  constructor(config: ContentToolbarConfig) {
    super();
    this.config = config;
    this.isExpanded = this.config.storage.getItemBoolean(STORAGE_EXPANDED_KEY);
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__content__toolbar: true,
    };
  }

  getIconForUrl(url: UrlConfig): string {
    if (url.level === UrlLevel.Public) {
      return 'public';
    }
    if (url.level === UrlLevel.Protected) {
      return 'vpn_lock';
    }
    if (url.level === UrlLevel.Source) {
      return 'source';
    }
    return 'lock';
  }

  template(): TemplateResult {
    return html`<div class=${classMap(this.classesForPart())}>
      <div class="le__part__content__toolbar__label">
        <strong>${this.config.editor.config.labels?.file || 'File'}:</strong>
        ${findPreviewValue(
          this.config.state?.file?.data || {},
          [],
          this.config.state.file?.file.path ||
            this.config.state.loadingFilePath ||
            'Loading…'
        )}
      </div>
      <div class="le__part__content__toolbar__icons">
        ${this.templateIconRefresh()}
        ${repeat(
          this.config.state?.file?.urls || [],
          url => {
            url.label;
          },
          url => {
            return html`<a
              href="${url.url}"
              class="le__tooltip--top"
              data-tip=${url.label}
              target="_blank"
              ><span class="material-icons">${this.getIconForUrl(url)}</span></a
            >`;
          }
        )}
        ${this.templateIconExpanded()}
      </div>
    </div>`;
  }

  templateIconExpanded(): TemplateResult {
    return html`<div
      class="le__clickable le__tooltip--top"
      data-tip=${this.isExpanded ? 'Content and preview' : 'Content only'}
      @click=${() => {
        this.isExpanded = !this.isExpanded;
        this.config.storage.setItemBoolean(
          STORAGE_EXPANDED_KEY,
          this.isExpanded
        );
        this.render();
      }}
    >
      <span class="material-icons"
        >${this.isExpanded ? 'fullscreen_exit' : 'fullscreen'}</span
      >
    </div>`;
  }

  templateIconRefresh(): TemplateResult {
    if (!this.config.state.file || this.config.state.loadingFilePath) {
      return html``;
    }

    return html`<div
      class="le__clickable le__tooltip--top"
      data-tip="Refresh file"
      @click=${() => {
        // Notify that the file refresh is happening.
        document.dispatchEvent(new CustomEvent(EVENT_REFRESH_FILE));

        this.render();
      }}
    >
      <span class="material-icons">refresh</span>
    </div>`;
  }
}
