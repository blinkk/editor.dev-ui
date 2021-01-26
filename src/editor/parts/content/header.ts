import {BasePart, Part} from '..';
import {TemplateResult, expandClasses, html} from '@blinkk/selective-edit';
import {ContentSectionPart} from './index';
import {LiveEditor} from '../../editor';

export interface ContentHeaderConfig {
  sections: Array<ContentSectionPart>;
}

export class ContentHeaderPart extends BasePart implements Part {
  config: ContentHeaderConfig;

  constructor(config: ContentHeaderConfig) {
    super();
    this.config = config;
  }

  classesForPart(): Array<string> {
    const classes = ['le__part__content__header'];
    return classes;
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${expandClasses(this.classesForPart())}>
      <div class="le__part__content__header__sections">...sections...</div>
      <div class="le__part__content__header__actions">
        <button class="le__button le__button--primary">Save changes</button>
      </div>
    </div>`;
  }
}
