import {BasePart, Part} from '.';
import {LiveEditorApiComponent, ProjectData, catchError} from '../api';
import {TemplateResult, expandClasses, html} from '@blinkk/selective-edit';
import {LiveEditor} from '../editor';
import {Modal} from '../ui/modal';
import {SitePart} from './menu/site';
import {Storage} from '../../utility/storage';
import {UsersPart} from './menu/users';
import {WorkspacesPart} from './menu/workspaces';

const MODAL_KEY = 'menu';
const STORAGE_DOCKED_KEY = 'live.menu.isDocked';

export interface MenuPartConfig {
  api: LiveEditorApiComponent;
  storage: Storage;
}

export interface MenuParts {
  site: SitePart;
  users: UsersPart;
  workspaces: WorkspacesPart;
}

export class MenuPart extends BasePart implements Part {
  config: MenuPartConfig;
  isDocked: boolean;
  modal?: Modal;
  parts: MenuParts;
  project?: ProjectData;

  constructor(config: MenuPartConfig) {
    super();
    this.config = config;
    this.isDocked = this.config.storage.getItemBoolean(STORAGE_DOCKED_KEY);
    this.parts = {
      site: new SitePart({
        api: this.config.api,
        isExpandedByDefault: true,
        storage: this.config.storage,
      }),
      users: new UsersPart({
        api: this.config.api,
        storage: this.config.storage,
      }),
      workspaces: new WorkspacesPart({
        api: this.config.api,
        storage: this.config.storage,
      }),
    };

    this.config.api
      .getProject()
      .then(projectData => {
        this.project = projectData;
        this.render();
      })
      .catch(catchError);
  }

  protected createModal(editor: LiveEditor): Modal {
    if (!editor.parts.modals.modals[MODAL_KEY]) {
      const modal = new Modal({
        classes: ['le__modal--docked', 'le__modal--docked-left'],
      });
      modal.templateModal = this.templateStructure.bind(this);
      this.modal = modal;
      editor.parts.modals.modals[MODAL_KEY] = modal;
    }
    return editor.parts.modals.modals[MODAL_KEY];
  }

  classesForPart(): Array<string> {
    return ['le__part__menu'];
  }

  /**
   * Close the menu when it is not docked.
   */
  close() {
    if (this.isDocked) {
      return;
    }
    this.modal?.hide();
  }

  /**
   * Dock the menu.
   */
  dock() {
    this.isDocked = true;
    this.config.storage.setItem(STORAGE_DOCKED_KEY, 'true');
    this.render();
  }

  /**
   * Open the menu when it is not docked.
   */
  open() {
    if (this.isDocked) {
      return;
    }
    this.modal?.show();
  }

  template(editor: LiveEditor): TemplateResult {
    if (!this.isDocked) {
      // Let the modal handle the display of the menu.
      this.createModal(editor);
      return html``;
    }

    return this.templateStructure(editor);
  }

  templateActionDocking(editor: LiveEditor): TemplateResult {
    let icon = 'last_page';
    let tip = 'Dock menu';
    let handleClick = () => {
      this.close();
      this.dock();
    };

    if (this.isDocked) {
      handleClick = () => {
        this.undock();
      };
      icon = 'first_page';
      tip = 'Undock menu';
    }

    return html`<div
      class="le__part__menu__action le__clickable le__tooltip--bottom-right"
      @click=${handleClick}
      data-tip=${tip}
    >
      <span class="material-icons">${icon}</span>
    </div>`;
  }

  templateActionClose(editor: LiveEditor): TemplateResult {
    if (this.isDocked) {
      return html``;
    }

    const handleClick = () => {
      this.close();
    };

    return html`<div
      class="le__part__menu__action le__clickable le__tooltip--bottom-right"
      @click=${handleClick}
      data-tip="Close menu"
    >
      <span class="material-icons">close</span>
    </div>`;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`<div class="le__part__menu__content">
      ${this.parts.workspaces.template(editor)}
      ${this.parts.site.template(editor)} ${this.parts.users.template(editor)}
    </div>`;
  }

  templateMenu(editor: LiveEditor): TemplateResult {
    return html`<div class="le__part__menu__header">
      <div class="le__part__menu__project">
        ${this.project?.title || html`&nbsp;`}
      </div>
      <div class="le__actions">
        ${this.templateActionDocking(editor)}
        ${this.templateActionClose(editor)}
      </div>
    </div>`;
  }

  templateStructure(editor: LiveEditor): TemplateResult {
    return html`<div class=${expandClasses(this.classesForPart())}>
      ${this.templateMenu(editor)} ${this.templateContent(editor)}
    </div>`;
  }

  /**
   * Toggle the menu when it is not docked.
   */
  toggle() {
    if (this.isDocked) {
      return;
    }
    this.modal?.toggle();
  }

  /**
   * Undock the menu.
   */
  undock() {
    this.isDocked = false;
    this.config.storage.setItem(STORAGE_DOCKED_KEY, 'false');
    this.render();
  }
}
