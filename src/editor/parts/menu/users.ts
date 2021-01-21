import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../../..';
import {MenuSectionPart} from './index';
import {UserData} from '../../api';
import {repeat} from 'lit-html/directives/repeat';

export class UsersPart extends MenuSectionPart {
  users?: Array<UserData>;
  usersPromise?: Promise<Array<UserData>>;

  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__menu__users');
    return classes;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    // Lazy load the workspace information.
    if (!this.users && !this.usersPromise) {
      this.usersPromise = this.config.api.getUsers();
      this.usersPromise.then(data => {
        this.users = data;
        this.usersPromise = undefined;
        this.render();
      });
    }

    if (!this.users) {
      return html`<div class="le__loading le__loading--pad"></div>`;
    }

    const templateGroup = (user: UserData): TemplateResult => {
      return html`<div class="le__list__item">
        <div class="le__list__item__icon">
          <span class="material-icons">group</span>
        </div>
        <div class="le__list__item__label">${user.name}</div>
        <div class="le__list__item__aside">${user.email}</div>
      </div>`;
    };

    const templateUser = (user: UserData): TemplateResult => {
      return html`<div class="le__list__item">
        <div class="le__list__item__icon">
          <span class="material-icons">person</span>
        </div>
        <div class="le__list__item__label">
          <a href="mailto:${user.email}">${user.name}</a>
        </div>
      </div>`;
    };

    return html`<div class="le__part__menu__section__content">
      <div class="le__list le__list--constrained le__list--indent">
        ${repeat(
          this.users || [],
          user => user.name,
          user => (user.isGroup ? templateGroup(user) : templateUser(user))
        )}
      </div>
    </div>`;
  }

  get title() {
    return 'Users';
  }
}
