import {MenuSectionPart, MenuSectionPartConfig} from './index';
import {TemplateResult, html} from '@blinkk/selective-edit';

import {UserData} from '../../../api';
import {repeat} from '@blinkk/selective-edit';
import {templateLoading} from '../../../template';

export type UsersMenuPartConfig = MenuSectionPartConfig;

export class UsersPart extends MenuSectionPart {
  config: UsersMenuPartConfig;
  users?: Array<UserData>;

  constructor(config: UsersMenuPartConfig) {
    super(config);

    this.config = config;
  }

  classesForPart(): Record<string, boolean> {
    const classes = super.classesForPart();
    classes.le__part__menu__users = true;
    return classes;
  }

  templateContent(): TemplateResult {
    // Lazy load the project information.
    if (!this.config.state.projectOrGetProject()) {
      return templateLoading({
        pad: true,
      });
    } else if (this.users === undefined) {
      this.users = this.config.state.project?.users ?? [];
    }

    if (!this.users.length) {
      return html`<div class="le__part__menu__section__content">
        <div class="le__list">
          <div class="le__list__item">
            <div class="le__list__item__label">No users configured.</div>
          </div>
        </div>
      </div>`;
    }

    return html`<div class="le__part__menu__section__content">
      <div
        class="le__list le__list--menu le__list--constrained le__list--indent"
      >
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

  templateTitle(): TemplateResult {
    return html`<div class="le__part__menu__section__title">
      ${this.config.editor.config.labels?.menuUsers || this.title}
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
