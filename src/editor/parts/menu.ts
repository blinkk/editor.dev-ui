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
        classes: ['le__modal--docked', 'le__modal--docked-left'],
      });
      modal.modalTemplate = this.templateStructure.bind(this);
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
      <div class="le__part__menu__project">...Project name...</div>
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
    this.config.storage.setItem('live.menu.isDocked', 'false');
    this.render();
  }
}
