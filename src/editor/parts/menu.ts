import {BasePart, Part} from '.';
import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../editor';
import {Modal} from '../ui/modal';
import {SitePart} from './menu/site';
import {Storage} from '../../utility/storage';
import {UsersPart} from './menu/users';
import {WorkspacesPart} from './menu/workspaces';
import {expandClasses} from '@blinkk/selective-edit/dist/src/utility/dom';

const MODAL_KEY = 'menu';

export interface MenuPartConfig {
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

  constructor(config: MenuPartConfig) {
    super();
    this.config = config;
    this.isDocked = this.config.storage.getItemBoolean('live.menu.isDocked');
    this.parts = {
      site: new SitePart({storage: this.config.storage}),
      users: new UsersPart({storage: this.config.storage}),
      workspaces: new WorkspacesPart({storage: this.config.storage}),
    };
  }

  protected createModal(editor: LiveEditor): Modal {
    if (!editor.parts.modals.modals[MODAL_KEY]) {
      const modal = new Modal({
        classes: [
          'live_editor__modal--docked',
          'live_editor__modal--docked-left',
        ],
      });
      modal.modalTemplate = this.templateStructure.bind(this);
      modal.isVisible = true; // TODO: Remove, debugging only.
      this.modal = modal;
      editor.parts.modals.modals[MODAL_KEY] = modal;
    }
    return editor.parts.modals.modals[MODAL_KEY];
  }

  classesForPart(): Array<string> {
    return ['live_editor__part__menu'];
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
    this.config.storage.setItem('live.menu.isDocked', 'true');
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
    let handleClick = () => {
      this.close();
      this.dock();
    };

    if (this.isDocked) {
      handleClick = () => {
        this.undock();
      };
      icon = 'first_page';
    }

    return html`<div
      class="live_editor__part__menu__action live_editor__clickable"
      @click=${handleClick}
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
      class="live_editor__part__menu__action live_editor__clickable"
      @click=${handleClick}
    >
      <span class="material-icons">close</span>
    </div>`;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`<div class="live_editor__part__menu__content">
      ${this.parts.workspaces.template(editor)}
      ${this.parts.site.template(editor)} ${this.parts.users.template(editor)}
    </div>`;
  }

  templateMenu(editor: LiveEditor): TemplateResult {
    return html`<div class="live_editor__part__menu__header">
      <div class="live_editor__part__menu__project">...Project name...</div>
      <div class="live_editor__part__menu__actions">
        <div class="live_editor__part__menu__actions">
          ${this.templateActionDocking(editor)}
          ${this.templateActionClose(editor)}
        </div>
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
    this.config.storage.setItem('live.menu.isDocked', 'false');
    this.render();
  }
}
