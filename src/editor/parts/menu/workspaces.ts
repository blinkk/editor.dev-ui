import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../../..';
import {MenuSectionPart} from './index';

export class WorkspacesPart extends MenuSectionPart {
  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__menu__workspaces');
    return classes;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`<div class="le__part__menu__section__content">
      <div class="le__list le__list--constrained le__list--indent">
        <div class="le__list__item le__list__item--primary le__clickable">
          <div class="le__list__item__icon">
            <span class="material-icons">add_circle</span>
          </div>
          <div class="le__list__item__label">Add workspace</div>
        </div>
        <div class="le__list__item">
          <div class="le__list__item__icon">
            <span class="material-icons">dashboard</span>
          </div>
          <div class="le__list__item__label">main</div>
        </div>
        <div class="le__list__item">
          <div class="le__list__item__icon">
            <span class="material-icons">dashboard</span>
          </div>
          <div class="le__list__item__label">staging</div>
        </div>
      </div>
    </div>`;
  }

  get title() {
    return 'Workspaces';
  }
}
