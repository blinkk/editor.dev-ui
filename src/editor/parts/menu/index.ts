import {BasePart, Part} from '..';
import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../../..';
import {Storage} from '../../../utility/storage';
import {expandClasses} from '@blinkk/selective-edit/dist/src/utility/dom';
import {slugify} from '../../../utility/slugify';

export interface MenuSectionPartConfig {
  /**
   * Storage class for working with settings.
   */
  storage: Storage;
}

export class MenuSectionPart extends BasePart implements Part {
  config: MenuSectionPartConfig;
  title: string;
  isExpanded?: boolean;

  constructor(config: MenuSectionPartConfig) {
    super();
    this.title = 'Section';
    this.config = config;
  }

  classesForPart(): Array<string> {
    return ['live_editor__part__menu__section'];
  }

  loadFromStorage() {
    if (this.isExpanded === undefined) {
      this.isExpanded = this.config.storage.getItemBoolean(
        `live.menu.section.${this.key}.isExpanded`
      );
    }
  }

  get key(): string {
    return slugify(this.title);
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${expandClasses(this.classesForPart())}>
      ${this.templateHeader(editor)}
      ${this.isExpanded ? this.templateContent(editor) : ''}
    </div>`;
  }

  templateActionExpandCollapse(editor: LiveEditor): TemplateResult {
    const icon = this.isExpanded ? 'expand_less' : 'expand_more';

    return html`<div class="live_editor__part__menu__action">
      <span class="material-icons">${icon}</span>
    </div>`;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`section content`;
  }

  templateHeader(editor: LiveEditor): TemplateResult {
    const handleClick = () => {
      this.isExpanded = !this.isExpanded;
      this.config.storage.setItem(
        `live.menu.section.${this.key}.isExpanded`,
        String(this.isExpanded)
      );
      this.render();
    };
    return html`<div
      class="live_editor__part__menu__section__header live_editor__clickable"
      @click=${handleClick}
    >
      <div class="live_editor__part__menu__section__title">${this.title}</div>
      <div class="live_editor__part__menu__actions">
        <div class="live_editor__part__menu__actions">
          ${this.templateActionExpandCollapse(editor)}
        </div>
      </div>
    </div>`;
  }
}
