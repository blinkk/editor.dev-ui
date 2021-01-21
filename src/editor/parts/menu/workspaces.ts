import {MenuSectionPart, MenuSectionPartConfig} from './index';
import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../../..';

export class WorkspacesPart extends MenuSectionPart {
  constructor(config: MenuSectionPartConfig) {
    super(config);
    this.title = 'Workspaces';
    // Need to wait for the correct title to be set before
    // loading from storage.
    this.loadFromStorage();
  }

  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__menu__workspaces');
    return classes;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`<div class="le__part__menu__section__content">
      <div class="le__part__menu__list le__part__menu__list--constrained">
        <div
          class="le__part__menu__list__item le__part__menu__list__item--primary"
        >
          <div class="le__part__menu__list__item__icon">
            <span class="material-icons">add_circle</span>
          </div>
          <div class="le__part__menu__list__item__label">Add workspace</div>
        </div>
        <div class="le__part__menu__list__item">
          <div class="le__part__menu__list__item__icon">
            <span class="material-icons">dashboard</span>
          </div>
          <div class="le__part__menu__list__item__label">main</div>
        </div>
        <div class="le__part__menu__list__item">
          <div class="le__part__menu__list__item__icon">
            <span class="material-icons">dashboard</span>
          </div>
          <div class="le__part__menu__list__item__label">staging</div>
        </div>
      </div>
    </div>`;
  }
}
