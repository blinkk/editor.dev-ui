import {BasePart, Part} from '..';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';
import {EditorState} from '../../state';
import {LiveEditor} from '../../..';
import {Storage} from '../../../utility/storage';
import {slugify} from '../../../utility/slugify';

export interface MenuSectionPartConfig {
  isExpandedByDefault?: boolean;
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  /**
   * Storage class for working with settings.
   */
  storage: Storage;
}

export class MenuSectionPart extends BasePart implements Part {
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

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${classMap(this.classesForPart())}>
      ${this.templateHeader(editor)}
      ${this.isExpanded ? this.templateContent(editor) : ''}
    </div>`;
  }

  templateActionExpandCollapse(editor: LiveEditor): TemplateResult {
    const icon = this.isExpanded ? 'expand_more' : 'chevron_right';

    return html`<div class="le__part__menu__action">
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
      class="le__part__menu__section__header le__clickable"
      @click=${handleClick}
    >
      <div class="le__part__menu__section__icon">
        ${this.templateActionExpandCollapse(editor)}
      </div>
      <div class="le__part__menu__section__title">${this.title}</div>
    </div>`;
  }

  get title() {
    return 'Section';
  }
}
