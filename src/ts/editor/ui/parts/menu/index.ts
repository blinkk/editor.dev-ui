import {BasePart, UiPartComponent, UiPartConfig} from '..';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';

import {DataStorage} from '../../../../utility/dataStorage';
import {EditorState} from '../../../state';
import {slugify} from '../../../../utility/slugify';

export interface MenuSectionPartConfig extends UiPartConfig {
  isExpandedByDefault?: boolean;
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  /**
   * Storage class for working with settings.
   */
  storage: DataStorage;
}

export class MenuSectionPart extends BasePart implements UiPartComponent {
  config: MenuSectionPartConfig;
  isExpanded?: boolean;

  constructor(config: MenuSectionPartConfig) {
    super();
    this.config = config;
    if (this.isExpanded === undefined) {
      this.isExpanded = this.config.storage.getItemBoolean(
        `live.menu.section.${this.key}.isExpanded`,
        this.config.isExpandedByDefault ? true : false
      );
    }
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__menu__section: true,
    };
  }

  get key(): string {
    return slugify(this.title);
  }

  template(): TemplateResult {
    return html`<div class=${classMap(this.classesForPart())}>
      ${this.templateHeader()} ${this.isExpanded ? this.templateContent() : ''}
    </div>`;
  }

  templateActionExpandCollapse(): TemplateResult {
    const icon = this.isExpanded ? 'expand_more' : 'chevron_right';

    return html`<div class="le__part__menu__action">
      <span class="material-icons">${icon}</span>
    </div>`;
  }

  templateContent(): TemplateResult {
    return html`section content`;
  }

  templateHeader(): TemplateResult {
    const handleClick = () => {
      this.isExpanded = !this.isExpanded;
      this.config.storage.setItem(
        `live.menu.section.${this.key}.isExpanded`,
        String(this.isExpanded)
      );
      this.render();
    };
    return html`<div
      class="le__part__menu__section__header le__clickable"
      @click=${handleClick}
    >
      <div class="le__part__menu__section__icon">
        ${this.templateActionExpandCollapse()}
      </div>
      ${this.templateTitle()}
    </div>`;
  }

  templateTitle(): TemplateResult {
    return html`<div class="le__part__menu__section__title">
      ${this.title}
    </div>`;
  }

  get title() {
    return 'Section';
  }
}
