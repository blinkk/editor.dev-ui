import {TemplateResult, html} from '@blinkk/selective-edit';
import {LiveEditor} from '../../..';
import {MenuSectionPart} from './index';
import {UserData} from '../../api';
import {repeat} from '@blinkk/selective-edit';
import {templateLoading} from '../../template';

export class UsersPart extends MenuSectionPart {
  users?: Array<UserData>;

  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__menu__users');
    return classes;
  }

  loadUsers() {
    this.users = this.config.state.getUsers((users: Array<UserData>) => {
      this.users = users;
      this.render();
    });
  }

  templateContent(editor: LiveEditor): TemplateResult {
    // Lazy load the users information.
    if (!this.users) {
      this.loadUsers();
      return templateLoading(editor, {
        pad: true,
      });
    }

    return html`<div class="le__part__menu__section__content">
      <div class="le__list le__list--constrained le__list--indent">
        ${repeat(
          this.users || [],
          user => user.name,
          user =>
            user.isGroup ? this.templateGroup(user) : this.templateUser(user)
        )}
      </div>
    </div>`;
  }

  templateGroup(user: UserData): TemplateResult {
    return html`<div class="le__list__item">
      <div class="le__list__item__icon">
        <span class="material-icons">group</span>
      </div>
      <div class="le__list__item__label">${user.name}</div>
      <div class="le__list__item__aside">${user.email}</div>
    </div>`;
  }

  templateUser(user: UserData): TemplateResult {
    return html`<div class="le__list__item">
      <div class="le__list__item__icon">
        <span class="material-icons">person</span>
      </div>
      <div class="le__list__item__label">
        <a href="mailto:${user.email}">${user.name}</a>
      </div>
    </div>`;
  }

  get title() {
    return 'Users';
  }
}
