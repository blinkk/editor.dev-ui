import {BasePart, Part} from '..';
import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../../..';
import {expandClasses} from '@blinkk/selective-edit/dist/src/utility/dom';

export interface MenuSectionPartConfig {
  isExpanded?: boolean;
  title: string;
}

export class MenuSectionPart extends BasePart implements Part {
  config: MenuSectionPartConfig;

  constructor(config: MenuSectionPartConfig) {
    super();
    this.config = config;
  }

  classesForPart(): Array<string> {
    return ['live_editor__part__menu__section'];
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${expandClasses(this.classesForPart())}>
      ${this.templateHeader(editor)}
      ${this.config.isExpanded ? this.templateContent(editor) : ''}
    </div>`;
  }

  templateActionExpandCollapse(editor: LiveEditor): TemplateResult {
    const icon = this.config.isExpanded ? 'expand_less' : 'expand_more';

    return html`<div class="live_editor__part__menu__action">
      <span class="material-icons">${icon}</span>
    </div>`;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`section content`;
  }

  templateHeader(editor: LiveEditor): TemplateResult {
    const handleClick = () => {
      this.config.isExpanded = !this.config.isExpanded;
      this.render();
    };
    return html`<div
      class="live_editor__part__menu__section__header live_editor__clickable"
      @click=${handleClick}
    >
      <div class="live_editor__part__menu__section__title">
        ${this.config.title}
      </div>
      <div class="live_editor__part__menu__actions">
        <div class="live_editor__part__menu__actions">
          ${this.templateActionExpandCollapse(editor)}
        </div>
      </div>
    </div>`;
  }
}
