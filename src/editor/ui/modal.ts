import {TemplateResult, html} from 'lit-html';
import {
  expandClasses,
  findParentByClassname,
} from '@blinkk/selective-edit/dist/src/utility/dom';
import {BaseUI} from '.';
import {LiveEditor} from '../editor';
import {LiveTemplate} from '../template';
import {UuidMixin} from '@blinkk/selective-edit/dist/src/mixins/uuid';
import {repeat} from 'lit-html/directives/repeat';

export interface ModalConfig {
  classes?: Array<string>;
  canClickToCloseFunc?: () => boolean;
}

export interface DialogModalConfig extends ModalConfig {
  title?: string;
}

export enum DialogActionLevel {
  Tertiary,
  Secondary,
  Primary,
  Extreme,
}

export interface DialogActionConfig {
  classes?: Array<string>;
  level?: DialogActionLevel;
  label: string;
  onClick: (evt: Event) => void;
}

export class Modal extends UuidMixin(BaseUI) {
  config: ModalConfig;
  isVisible: boolean;
  templateModal?: LiveTemplate;

  constructor(config: ModalConfig) {
    super();
    this.config = config;
    this.isVisible = false;
  }

  classesForModal(): Array<string> {
    const classes: Array<string> = ['le__modal'];

    if (this.config.classes) {
      for (const classname of this.config.classes) {
        classes.push(classname);
      }
    }

    return classes;
  }

  handleOffClick(evt: Event) {
    const modalContent = findParentByClassname(
      evt.target as HTMLElement,
      'le__modal__content'
    );

    // Do not close when clicking on the modal content.
    if (modalContent) {
      return;
    }

    // Allow for overriding the ability to close when clicking
    // out of the modal content.
    if (this.config.canClickToCloseFunc) {
      if (this.config.canClickToCloseFunc()) {
        this.hide();
      }
    } else {
      this.hide();
    }
  }

  hide() {
    this.isVisible = false;
    this.render();
  }

  show() {
    this.isVisible = true;
    this.render();
  }

  template(editor: LiveEditor): TemplateResult {
    if (!this.isVisible) {
      return html``;
    }

    return html`<div class=${expandClasses(this.classesForModal())}>
      <div
        class="le__modal__container"
        @click=${this.handleOffClick.bind(this)}
      >
        ${this.templateContent(editor)}
      </div>
    </div>`;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    if (!this.templateModal) {
      return html`Modal missing template.`;
    }

    return html`<div class="le__modal__content">
      ${this.templateModal(editor)}
    </div>`;
  }

  toggle() {
    this.isVisible = !this.isVisible;
    this.render();
  }
}

export class DialogModal extends Modal {
  actions: Array<DialogActionConfig>;
  config: DialogModalConfig;

  constructor(config: DialogModalConfig) {
    super(config);
    this.config = config;
    this.actions = [];
  }

  /**
   * Add a cancel action to the dialog.
   */
  addCancelAction() {
    this.actions.push({
      label: 'Cancel',
      onClick: () => {
        this.hide();
      },
    });
  }

  classesForAction(config: DialogActionConfig): Array<string> {
    const classes = ['le__button le__modal__action'];

    if (config.classes) {
      for (const classname of config.classes) {
        classes.push(classname);
      }
    }

    if (config.level === DialogActionLevel.Extreme) {
      classes.push('le__button--extreme');
    }

    if (config.level === DialogActionLevel.Primary) {
      classes.push('le__button--primary');
    }

    if (config.level === DialogActionLevel.Secondary) {
      classes.push('le__button--secondary');
    }

    return classes;
  }

  classesForModal(): Array<string> {
    const classes = super.classesForModal();

    classes.push('le__modal--dialog');

    return classes;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    if (!this.templateModal) {
      return html`Modal missing template.`;
    }

    return html`<div class="le__modal__content">
      ${this.templateHeader(editor)}
      <div class="le__modal__content__template">
        ${this.templateModal(editor)}
      </div>
      ${this.templateFooter(editor)}
    </div>`;
  }

  templateFooter(editor: LiveEditor): TemplateResult {
    if (!this.actions.length) {
      return html``;
    }

    const tertiaryActions = this.actions.filter(
      (config: DialogActionConfig) => {
        return (
          config.level === DialogActionLevel.Tertiary ||
          config.level === undefined
        );
      }
    );
    const primaryActions = this.actions.filter((config: DialogActionConfig) => {
      return (
        config.level === DialogActionLevel.Primary ||
        config.level === DialogActionLevel.Extreme
      );
    });
    const secondaryActions = this.actions.filter(
      (config: DialogActionConfig) =>
        config.level === DialogActionLevel.Secondary
    );

    const templateActionButton = (config: DialogActionConfig) =>
      html`<button
        class=${expandClasses(this.classesForAction(config))}
        @click=${config.onClick}
      >
        ${config.label}
      </button>`;

    return html`<div class="le__modal__content__footer">
      <div class="le__modal__actions__tertiary">
        ${repeat(
          tertiaryActions,
          (config: DialogActionConfig) => config.label,
          templateActionButton
        )}
      </div>
      <div class="le__modal__actions__secondary">
        ${repeat(
          secondaryActions,
          (config: DialogActionConfig) => config.label,
          templateActionButton
        )}
      </div>
      <div class="le__modal__actions__primary">
        ${repeat(
          primaryActions,
          (config: DialogActionConfig) => config.label,
          templateActionButton
        )}
      </div>
    </div>`;
  }

  templateHeader(editor: LiveEditor): TemplateResult {
    if (!this.config.title) {
      return html``;
    }
    return html`<div class="le__modal__content__header">
      ${this.config.title}
    </div>`;
  }
}
