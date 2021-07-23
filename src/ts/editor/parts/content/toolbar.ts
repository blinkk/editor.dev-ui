import {BasePart, Part} from '..';
import {TemplateResult, classMap, html, repeat} from '@blinkk/selective-edit';
import {UrlConfig, UrlLevel} from '../../api';
import {DataStorage} from '../../../utility/dataStorage';
import {EditorState} from '../../state';
import {LiveEditor} from '../../editor';
import {findPreviewValue} from '@blinkk/selective-edit/dist/utility/preview';

const STORAGE_EXPANDED_KEY = 'live.content.isExpanded';

export interface ContentToolbarConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  /**
   * Storage class for working with settings.
   */
  storage: DataStorage;
}

export class ContentToolbarPart extends BasePart implements Part {
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

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${classMap(this.classesForPart())}>
      <div class="le__part__content__toolbar__label">
        <strong>${editor.config.labels?.file || 'File'}:</strong>
        ${findPreviewValue(
          this.config.state?.file?.data || {},
          [],
          this.config.state.file?.file.path || ''
        )}
      </div>
      <div class="le__part__content__toolbar__icons">
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
        ${this.templateExpanded(editor)}
      </div>
    </div>`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateExpanded(editor: LiveEditor): TemplateResult {
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
}
