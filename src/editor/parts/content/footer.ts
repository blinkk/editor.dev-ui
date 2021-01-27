import {BasePart, Part} from '..';
import {TemplateResult, expandClasses, html} from '@blinkk/selective-edit';
import {LiveEditor} from '../../editor';

export interface ContentFooterConfig {}

export class ContentFooterPart extends BasePart implements Part {
  config: ContentFooterConfig;

  constructor(config: ContentFooterConfig) {
    super();
    this.config = config;
  }

  classesForPart(): Array<string> {
    const classes = ['le__part__content__footer'];
    return classes;
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${expandClasses(this.classesForPart())}>
      <div class="le__part__content__logo">...logo...</div>
      <div class="le__part__content__dev_tools">Developer tools:</div>
      <div class="le__part__content__dev_tools__icons">
        <div
          class="le__tooltip--top"
          aria-label="Highlight auto fields"
          aria-role="link"
          data-tip="Highlight auto fields"
        >
          <span class="material-icons">assistant</span>
        </div>
        <div
          class="le__tooltip--top"
          aria-label="Deep link to fields"
          aria-role="link"
          data-tip="Deep link to fields"
        >
          <span class="material-icons">link</span>
        </div>
        <div
          class="le__tooltip--top"
          aria-label="Highlight dirty fields"
          aria-role="link"
          data-tip="Highlight dirty fields"
        >
          <span class="material-icons">change_history</span>
        </div>
      </div>
    </div>`;
  }
}
