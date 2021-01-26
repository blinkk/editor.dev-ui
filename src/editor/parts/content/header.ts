import {BasePart, Part} from '..';
import {ContentSectionPart, STORAGE_CONTENT_SECTION} from './index';
import {
  TemplateResult,
  expandClasses,
  html,
  repeat,
} from '@blinkk/selective-edit';
import {LiveEditor} from '../../editor';
import {LiveEditorApiComponent} from '../../api';
import {Storage} from '../../../utility/storage';

export interface ContentHeaderConfig {
  api: LiveEditorApiComponent;
  sections: Array<ContentSectionPart>;
  storage: Storage;
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

  handleSectionClick(evt: Event, section: ContentSectionPart) {
    for (const sectionPart of this.config.sections) {
      sectionPart.isVisible = false;
    }
    this.config.storage.setItem(STORAGE_CONTENT_SECTION, section.section);
    section.isVisible = true;
    this.render();
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${expandClasses(this.classesForPart())}>
      <div class="le__part__content__header__sections">
        ${repeat(
          this.config.sections,
          section => section.section,
          section =>
            html`<div
              class="le__part__content__header__section le__clickable ${section.isVisible
                ? 'le__part__content__header__section--selected'
                : ''}"
              @click=${(evt: Event) => this.handleSectionClick(evt, section)}
            >
              ${section.label}
            </div>`
        )}
      </div>
      <div class="le__part__content__header__actions">
        <button class="le__button le__button--primary">Save changes</button>
      </div>
    </div>`;
  }
}
