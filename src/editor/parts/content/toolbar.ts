import {BasePart, Part} from '..';
import {
  TemplateResult,
  expandClasses,
  html,
  repeat,
} from '@blinkk/selective-edit';
import {EditorState} from '../../state';
import {LiveEditor} from '../../editor';
import {EditorUrlConfig, EditorUrlLevel} from '../../api';

export interface ContentToolbarConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
}

export class ContentToolbarPart extends BasePart implements Part {
  config: ContentToolbarConfig;

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
      <div class="le__part__content__toolbar__label">Page: ...</div>
      <div class="le__part__content__toolbar__icons">
        ${repeat(
          this.config.state?.file?.urls || [],
          url => {
            url.label;
          },
          url => {
            return html`<a href="${url.url}"
              ><span class="material-icons">${this.getIconForUrl(url)}</span></a
            >`;
          }
        )}
        <span class="material-icons le__clickable">fullscreen</span>
      </div>
    </div>`;
  }
}
