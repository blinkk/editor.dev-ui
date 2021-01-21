import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../../..';
import {MenuSectionPart} from './index';

export class UsersPart extends MenuSectionPart {
  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__menu__users');
    return classes;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`<div class="le__part__menu__section__content">
      <div class="le__list le__list--constrained le__list--indent">
        <div class="le__list__item">
          <div class="le__list__item__icon">
            <span class="material-icons">person</span>
          </div>
          <div class="le__list__item__label">Janet Slade</div>
          <div class="le__list__item__aside">Admin</div>
        </div>
        <div class="le__list__item">
          <div class="le__list__item__icon">
            <span class="material-icons">dashboard</span>
          </div>
          <div class="le__list__item__label">Don Jules</div>
          <div class="le__list__item__aside">User</div>
        </div>
        <div class="le__list__item">
          <div class="le__list__item__icon">
            <span class="material-icons">dashboard</span>
          </div>
          <div class="le__list__item__label">Yvonne Lars</div>
          <div class="le__list__item__aside">User</div>
        </div>
      </div>
    </div>`;
  }

  get title() {
    return 'Users';
  }
}
