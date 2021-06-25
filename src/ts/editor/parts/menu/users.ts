import {ProjectData, UserData} from '../../api';
import {TemplateResult, html} from '@blinkk/selective-edit';
import {LiveEditor} from '../../editor';
import {MenuSectionPart} from './index';
import {repeat} from '@blinkk/selective-edit';
import {templateLoading} from '../../template';

export class UsersPart extends MenuSectionPart {
  users?: Array<UserData>;

  classesForPart(): Record<string, boolean> {
    const classes = super.classesForPart();
    classes.le__part__menu__users = true;
    return classes;
  }

  loadProject() {
    this.users = this.config.state.getProject((project: ProjectData) => {
      // Default to array so it does not try to keep reloading the project data.
      this.users = project.users || [];
      this.render();
    })?.users;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    // Lazy load the users information.
    if (this.users === undefined) {
      this.loadProject();
      return templateLoading(editor, {
        pad: true,
      });
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

  templateTitle(editor: LiveEditor): TemplateResult {
    return html`<div class="le__part__menu__section__title">
      ${editor.config.labels?.menuUsers || this.title}
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
