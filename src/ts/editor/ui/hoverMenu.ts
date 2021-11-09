import {TemplateResult, classMap, html, repeat} from '@blinkk/selective-edit';

import {BaseUI} from './index';
import {ListenersMixin} from '../../mixin/listeners';
import {UuidMixin} from '@blinkk/selective-edit/dist/mixins/uuid';

export interface HoverMenuConfig {
  /**
   * Custom classes for the hover menu.
   */
  classes?: Array<string>;
  items: Array<HoverMenuItemConfig>;
}

/**
 * Configuration for menu item.
 *
 * Controls how the menu item looks and the handlers for events.
 */
export interface HoverMenuItemConfig {
  /**
   * Label explaining the usage of the menu item.
   */
  label: string;
  /**
   * Small description of the menu item.
   */
  description?: string;
  /**
   * Material icon to use for the menu item.
   */
  icon?: string;
  /**
   * Ability to check if the menu item is disabled.
   */
  isDisabled?: () => boolean | undefined;
  /**
   * Event handler for when the menu item is clicked.
   */
  onClick: (evt: Event) => void;
}

export class HoverMenu extends ListenersMixin(UuidMixin(BaseUI)) {
  config: HoverMenuConfig;
  isVisible: boolean;

  constructor(config: HoverMenuConfig) {
    super();
    this.config = config;
    this.isVisible = false;
  }

  classesForMenu(): Record<string, boolean> {
    const classes: Record<string, boolean> = {
      le__hover_menu: true,
    };

    if (this.config.classes) {
      for (const classname of this.config.classes) {
        classes[classname] = true;
      }
    }

    return classes;
  }

  handleKeyup(evt: KeyboardEvent) {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      evt.stopPropagation();
      this.hide();
    }
  }

  handleOffClick(evt: Event) {
    const menuContent = (evt.target as HTMLElement).closest('.le__hover_menu');

    // Do not close when clicking on the menu content.
    if (menuContent) {
      // There may be another menu under the menu, do not want to trigger other
      // hidden menus.
      evt.stopPropagation();

      return;
    }

    this.hide();
  }

  hide() {
    this.isVisible = false;

    // Stop listening for clicks when hidden.
    document.removeEventListener('click', this.handleOffClick.bind(this));
    this.triggerListener('hide');
    this.render();
  }

  show() {
    this.isVisible = true;

    // Listen for clicks off from the menu.
    document.addEventListener('click', this.handleOffClick.bind(this));

    this.triggerListener('show');
    this.render();
  }

  template(): TemplateResult {
    if (!this.isVisible) {
      return html``;
    }

    return html`<div
      class=${classMap(this.classesForMenu())}
      @keyup=${this.handleKeyup.bind(this)}
    >
      ${this.templateContent()}
    </div>`;
  }

  templateContent(): TemplateResult {
    return html`<div class="le__hover_menu__container">
      ${repeat(
        this.config.items,
        item => {
          item.label;
        },
        item => {
          return html`<div
            class="le__hover_menu__item"
            ?disabled=${item.isDisabled ? item.isDisabled() ?? false : false}
            @click=${(evt: Event) => {
              if (item.isDisabled && item.isDisabled()) {
                return;
              }

              item.onClick(evt);

              // Automatically close the menu after clicking on a item.
              this.hide();
              evt.stopPropagation();
            }}
          >
            ${item.icon
              ? html`<div class="le__hover_menu__item__icon">
                  <span class="material-icons icon icon--small"
                    >${item.icon}</span
                  >
                </div>`
              : html``}
            <div class="le__hover_menu__item__label">${item.label}</div>
          </div>`;
        }
      )}
    </div>`;
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}
