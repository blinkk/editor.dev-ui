import {BasePart, Part} from '.';
import {DialogPriorityLevel, Modal} from '../ui/modal';
import {EditorState, Schemes} from '../state';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';

import {DataStorage} from '../../utility/dataStorage';
import {EVENT_FILE_LOAD} from '../events';
import {LiveEditor} from '../editor';
import {SitePart} from './menu/site';
import {UsersPart} from './menu/users';
import {WorkspacesPart} from './menu/workspaces';

const MODAL_KEY = 'menu';
const STORAGE_DOCKED_KEY = 'live.menu.isDocked';

export interface MenuPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  storage: DataStorage;
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
    this.isDocked = this.config.storage.getItemBoolean(STORAGE_DOCKED_KEY);
    this.parts = {
      site: new SitePart({
        isExpandedByDefault: true,
        state: this.config.state,
        storage: this.config.storage,
      }),
      users: new UsersPart({
        state: this.config.state,
        storage: this.config.storage,
      }),
      workspaces: new WorkspacesPart({
        state: this.config.state,
        storage: this.config.storage,
      }),
    };
  }

  protected createModal(editor: LiveEditor): Modal {
    if (!editor.parts.modals.modals[MODAL_KEY]) {
      const modal = new Modal({
        classes: ['le__modal--docked', 'le__modal--docked-left'],
        priority: DialogPriorityLevel.Low,
      });
      modal.templateModal = this.templateStructure.bind(this);
      this.modal = modal;
      editor.parts.modals.modals[MODAL_KEY] = modal;

      // When loading a file, close the menu modal.
      // Hides the menu when the file is starting to load.
      document.addEventListener(EVENT_FILE_LOAD, () => {
        modal.hide();
      });
    }
    return editor.parts.modals.modals[MODAL_KEY];
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__menu: true,
    };
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
    this.config.storage.setItemBoolean(STORAGE_DOCKED_KEY, this.isDocked);
    this.render();
  }

  loadProject() {
    this.config.state.getProject();
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      class="le__part__menu__action le__clickable le__tooltip--bottom"
      @click=${handleClick}
      data-tip=${tip}
    >
      <span class="material-icons">${icon}</span>
    </div>`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateActionClose(editor: LiveEditor): TemplateResult {
    if (this.isDocked) {
      return html``;
    }

    const handleClick = () => {
      this.close();
    };

    return html`<div
      class="le__part__menu__action le__clickable le__tooltip--bottom"
      @click=${handleClick}
      data-tip="Close menu"
    >
      <span class="material-icons">close</span>
    </div>`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateActionScheme(editor: LiveEditor): TemplateResult {
    let currentMode = this.config.state.prefersDarkScheme
      ? Schemes.Dark
      : Schemes.Light;

    if (this.config.state.scheme === Schemes.Dark) {
      currentMode = Schemes.Dark;
    } else if (this.config.state.scheme === Schemes.Light) {
      currentMode = Schemes.Light;
    }

    const toggleMode =
      currentMode === Schemes.Light ? Schemes.Dark : Schemes.Light;
    const icon = currentMode === Schemes.Dark ? 'light_mode' : 'dark_mode';
    const tip = `${toggleMode} mode`;

    return html`<div
      class="le__part__menu__action le__clickable le__tooltip--bottom"
      @click=${() => {
        this.config.state.setScheme(toggleMode);
        this.render();
      }}
      data-tip=${tip}
    >
      <span class="material-icons">${icon}</span>
    </div>`;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`<div class="le__part__menu__content">
      ${this.parts.workspaces.template(editor)}
      ${this.parts.site.template(editor)} ${this.parts.users.template(editor)}
    </div>`;
  }

  templateMenu(editor: LiveEditor): TemplateResult {
    const project = this.config.state.project;

    // Lazy load the project.
    if (!project) {
      this.loadProject();
    }

    return html`<div class="le__part__menu__header">
      <div class="le__part__menu__project">
        ${project?.title || html`&nbsp;`}
      </div>
      <div class="le__actions">
        ${this.templateActionScheme(editor)}
        ${this.templateActionDocking(editor)}
        ${this.templateActionClose(editor)}
      </div>
    </div>`;
  }

  templateStructure(editor: LiveEditor): TemplateResult {
    return html`<div class=${classMap(this.classesForPart())}>
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
    this.config.storage.setItemBoolean(STORAGE_DOCKED_KEY, this.isDocked);
    this.render();
  }
}
