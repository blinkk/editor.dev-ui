import {
  DeepObject,
  EditorConfig,
  SelectiveEditor,
  TemplateResult,
  expandClasses,
  findParentByClassname,
  html,
  repeat,
} from '@blinkk/selective-edit';
import {ApiError} from '../api';
import {BaseUI} from '.';
import {LiveEditor} from '../editor';
import {LiveTemplate} from '../template';
import {UuidMixin} from '@blinkk/selective-edit/dist/src/mixins/uuid';
import {templateApiError} from './error';

export interface ModalConfig {
  classes?: Array<string>;
  canClickToCloseFunc?: () => boolean;
}

export interface DialogModalConfig extends ModalConfig {
  title?: string;
}

export interface FormDialogModalConfig extends DialogModalConfig {
  selectiveConfig: EditorConfig;
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
  isDisabledFunc: () => boolean;
  isSubmit?: boolean;
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

  handleKeyup(evt: KeyboardEvent) {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      evt.stopPropagation();

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

    return html`<div
      class=${expandClasses(this.classesForModal())}
      @keyup=${this.handleKeyup.bind(this)}
    >
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
  isProcessing?: boolean;

  constructor(config: DialogModalConfig) {
    super(config);
    this.config = config;
    this.actions = [];
  }

  /**
   * Add a cancel action to the dialog.
   */
  addCancelAction(label = 'Cancel') {
    this.actions.push({
      label: label,
      isDisabledFunc: () => false,
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

    if (this.isProcessing) {
      classes.push('le__modal--processing');
    }

    return classes;
  }

  startProcessing() {
    this.isProcessing = true;
    this.render();
  }

  stopProcessing(hideModal = false) {
    this.isProcessing = false;
    if (hideModal) {
      this.isVisible = false;
    }
    this.render();
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`<div class="le__modal__content">
      ${this.templateHeader(editor)} ${this.templateTemplate(editor)}
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
        ?disabled=${config.isDisabledFunc()}
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
      ${this.isProcessing
        ? html`<div class="le__loading le__loading--pad-horizontal"></div>`
        : ''}
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

  templateTemplate(editor: LiveEditor): TemplateResult {
    if (!this.templateModal) {
      return html`Modal missing template.`;
    }

    return html` <div class="le__modal__content__template">
      ${this.templateModal(editor)}
    </div>`;
  }
}

export class FormDialogModal extends DialogModal {
  config: FormDialogModalConfig;
  data: DeepObject;
  error?: ApiError;
  selective: SelectiveEditor;

  constructor(config: FormDialogModalConfig) {
    super(config);
    this.config = config;
    this.data = new DeepObject({});
    this.selective = new SelectiveEditor(this.config.selectiveConfig);
  }

  handleKeyup(evt: KeyboardEvent) {
    super.handleKeyup(evt);

    if (evt.key === 'Enter') {
      for (const action of this.actions) {
        if (action.isSubmit) {
          evt.preventDefault();
          evt.stopPropagation();

          if (action.isDisabledFunc && action.isDisabledFunc()) {
            // Disabled, do nothing.
            return;
          }

          // 'Submit' the form.
          action.onClick(evt);
        }
      }
    }
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`<div class="le__modal__content">
      ${this.templateHeader(editor)} ${this.templateTemplate(editor)}
      ${templateApiError(editor, this.error, {pad: true})}
      ${this.templateFooter(editor)}
    </div>`;
  }
}
