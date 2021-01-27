import {BasePart, Part} from '..';
import {EditorUrlConfig, EditorUrlLevel} from '../../api';
import {
  TemplateResult,
  expandClasses,
  html,
  repeat,
} from '@blinkk/selective-edit';
import {EditorState} from '../../state';
import {LiveEditor} from '../../editor';

export interface ContentToolbarConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
}

export class ContentToolbarPart extends BasePart implements Part {
  config: ContentToolbarConfig;
  isExpanded?: boolean;

  constructor(config: ContentToolbarConfig) {
    super();
    this.config = config;
  }

  classesForPart(): Array<string> {
    const classes = ['le__part__content__toolbar'];
    return classes;
  }

  getIconForUrl(url: EditorUrlConfig): string {
    if (url.level === EditorUrlLevel.PUBLIC) {
      return 'public';
    }
    if (url.level === EditorUrlLevel.PROTECTED) {
      return 'vpn_lock';
    }
    return 'lock';
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${expandClasses(this.classesForPart())}>
      <div class="le__part__content__toolbar__label">
        <strong>Page:</strong> ...guess label...
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

  templateExpanded(editor: LiveEditor): TemplateResult {
    // TODO: If there is nothing to preview, do not need an expand button.

    return html`<div
      class="le__clickable le__tooltip--top"
      data-tip=${this.isExpanded ? 'Content and preview' : 'Content only'}
      @click=${() => {
        this.isExpanded = !this.isExpanded;
        this.render();
      }}
    >
      <span class="material-icons"
        >${this.isExpanded ? 'fullscreen_exit' : 'fullscreen'}</span
      >
    </div>`;
  }
}
