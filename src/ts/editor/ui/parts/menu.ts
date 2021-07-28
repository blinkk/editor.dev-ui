import {BasePart, LazyUiParts, UiPartComponent, UiPartConfig} from '.';
import {DialogPriorityLevel, Modal} from '../../ui/modal';
import {EditorState, Schemes} from '../../state';
import {SiteMenuPartConfig, SitePart} from './menu/site';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';
import {UsersMenuPartConfig, UsersPart} from './menu/users';
import {WorkspacesMenuPartConfig, WorkspacesPart} from './menu/workspaces';

import {DataStorage} from '../../../utility/dataStorage';
import {EVENT_FILE_LOAD} from '../../events';

const MODAL_KEY = 'menu';
const STORAGE_DOCKED_KEY = 'live.menu.isDocked';

export interface MenuPartConfig extends UiPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  storage: DataStorage;
}

/**
 * Ui part for displaying the menu.
 *
 * The menu can be displayed in a docked state or as a floating menu.
 *
 * When it is docked the template renders normally, but when it is
 * not docked it is rendered using a modal overlay.
 */
export class MenuPart extends BasePart implements UiPartComponent {
  config: MenuPartConfig;
  isDocked: boolean;
  modal?: Modal;
  parts: LazyUiParts;

  constructor(config: MenuPartConfig) {
    super();
    this.config = config;
    this.isDocked = this.config.storage.getItemBoolean(STORAGE_DOCKED_KEY);

    this.parts = new LazyUiParts();

    this.parts.register('site', SitePart, {
      editor: this.config.editor,
      isExpandedByDefault: true,
      state: this.config.state,
      storage: this.config.storage,
    } as SiteMenuPartConfig);
    this.parts.register('users', UsersPart, {
      editor: this.config.editor,
      state: this.config.state,
      storage: this.config.storage,
    } as UsersMenuPartConfig);
    this.parts.register('workspaces', WorkspacesPart, {
      editor: this.config.editor,
      state: this.config.state,
      storage: this.config.storage,
    } as WorkspacesMenuPartConfig);
  }

  protected createModal(): Modal {
    if (!this.config.editor.ui.partModals.modals[MODAL_KEY]) {
      const modal = new Modal({
        classes: ['le__modal--docked', 'le__modal--docked-left'],
        priority: DialogPriorityLevel.Low,
      });
      modal.templateModal = this.templateStructure.bind(this);
      this.modal = modal;
      this.config.editor.ui.partModals.modals[MODAL_KEY] = modal;

      // When loading a file, close the menu modal.
      // Hides the menu when the file is starting to load.
      document.addEventListener(EVENT_FILE_LOAD, () => {
        modal.hide();
      });
    }
    return this.config.editor.ui.partModals.modals[MODAL_KEY];
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__panel: true,
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

  get partSite(): SitePart {
    return this.parts.get('site') as SitePart;
  }

  get partUsers(): UsersPart {
    return this.parts.get('users') as UsersPart;
  }

  get partWorkspaces(): WorkspacesPart {
    return this.parts.get('workspaces') as WorkspacesPart;
  }

  template(): TemplateResult {
    if (!this.isDocked) {
      // Let the modal handle the display of the menu.
      this.createModal();
      return html``;
    }

    return this.templateStructure();
  }

  templateActionDocking(): TemplateResult {
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

  templateActionClose(): TemplateResult {
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
  templateActionScheme(): TemplateResult {
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

  templateContent(): TemplateResult {
    return html`<div class="le__part__menu__content">
      ${this.partWorkspaces.template()} ${this.partSite.template()}
      ${this.partUsers.template()}
    </div>`;
  }

  templateMenu(): TemplateResult {
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
        ${this.templateActionScheme()} ${this.templateActionDocking()}
        ${this.templateActionClose()}
      </div>
    </div>`;
  }

  templateStructure(): TemplateResult {
    return html`<div class=${classMap(this.classesForPart())}>
      ${this.templateMenu()} ${this.templateContent()}
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
