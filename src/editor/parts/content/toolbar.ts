import {BasePart, Part} from '..';
import {TemplateResult, expandClasses, html} from '@blinkk/selective-edit';
import {LiveEditor} from '../../editor';

export interface ContentToolbarConfig {}

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

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${expandClasses(this.classesForPart())}>
      <div class="le__part__content__toolbar__label">Page: ...</div>
      <div class="le__part__content__toolbar__icons">
        <span class="material-icons le__clickable">lock</span>
        <span class="material-icons le__clickable">vpn_lock</span>
        <span class="material-icons le__clickable">public</span>
        <span class="material-icons le__clickable">fullscreen</span>
      </div>
    </div>`;
  }
}
