import {
  DeepObject,
  EditorConfig,
  SelectiveEditor,
  TemplateResult,
  classMap,
  findParentByClassname,
  html,
  repeat,
} from '@blinkk/selective-edit';
import {EditorState, StatePromiseKeys} from '../state';
import {LiveEditorSelectiveEditorConfig, cloneSelectiveConfig} from '../editor';
import {LiveTemplate, templateLoading} from '../template';
import {
  ProjectTypeComponent,
  updateSelectiveForProjectType,
} from '../../projectType/projectType';

import {ApiError} from '../api';
import {BaseUI} from './index';
import {ListenersMixin} from '../../mixin/listeners';
import {UuidMixin} from '@blinkk/selective-edit/dist/mixins/uuid';
import merge from 'lodash.merge';
import {templateApiError} from './error';

/**
 * Priority of the modal.
 *
 * Used to determine the stacking order when multiple modals are
 * displayed at once.
 */
export enum DialogPriorityLevel {
  Low,
  Normal,
  High,
}

export interface ModalConfig {
  /**
   * Custom classes for the modal window.
   */
  classes?: Array<string>;
  /**
   * Method to determine if the modal can be closed by clicking outside
   * of the modal content or by pressing ESC.
   */
  canClickToCloseFunc?: () => boolean;
  priority?: DialogPriorityLevel;
}

export interface DialogModalConfig extends ModalConfig {
  /**
   * Title for the dialog modal.
   */
  title?: string;
}

export interface FormDialogModalConfig extends DialogModalConfig {
  /**
   * Configuration for creating the selective editor.
   */
  selectiveConfig: EditorConfig;
  state: EditorState;
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

export class Modal extends ListenersMixin(UuidMixin(BaseUI)) {
  config: ModalConfig;
  isVisible: boolean;
  templateModal?: LiveTemplate;

  constructor(config: ModalConfig) {
    super();
    this.config = config;
    this.isVisible = false;
  }

  classesForModal(): Record<string, boolean> {
    const classes: Record<string, boolean> = {
      le__modal: true,
      'le__modal--low_priority':
        this.config.priority === DialogPriorityLevel.Low,
      'le__modal--high_priority':
        this.config.priority === DialogPriorityLevel.High,
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
    this.triggerListener('hide');
    this.render();
  }

  show() {
    this.isVisible = true;
    this.triggerListener('show');
    this.render();
  }

  template(): TemplateResult {
    if (!this.isVisible) {
      return html``;
    }

    return html`<div
      class=${classMap(this.classesForModal())}
      @keyup=${this.handleKeyup.bind(this)}
    >
      <div
        class="le__modal__container"
        @click=${this.handleOffClick.bind(this)}
      >
        ${this.templateContent()}
      </div>
    </div>`;
  }

  templateContent(): TemplateResult {
    if (!this.templateModal) {
      return html`Modal missing template.`;
    }

    return html`<div class="le__modal__content">${this.templateModal()}</div>`;
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
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

  classesForAction(config: DialogActionConfig): Record<string, boolean> {
    const classes: Record<string, boolean> = {
      le__button: true,
      le__modal__action: true,
      'le__button--extreme': config.level === DialogActionLevel.Extreme,
      'le__button--outline': config.level === DialogActionLevel.Primary,
      'le__button--primary': config.level === DialogActionLevel.Primary,
      'le__button--secondary': config.level === DialogActionLevel.Secondary,
    };

    if (config.classes) {
      for (const classname of config.classes) {
        classes[classname] = true;
      }
    }

    return classes;
  }

  classesForModal(): Record<string, boolean> {
    const classes = super.classesForModal();

    classes['le__modal--dialog'] = true;
    classes['le__modal--processing'] = this.isProcessing || false;

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

  templateContent(): TemplateResult {
    return html`<div class="le__modal__content">
      ${this.templateHeader()} ${this.templateTemplate()}
      ${this.templateFooter()}
    </div>`;
  }

  templateFooter(): TemplateResult {
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
        class=${classMap(this.classesForAction(config))}
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
        ? templateLoading({
            padHorizontal: true,
          })
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

  templateHeader(): TemplateResult {
    if (!this.config.title) {
      return html``;
    }
    return html`<div class="le__modal__content__header">
      ${this.config.title}
    </div>`;
  }

  templateTemplate(): TemplateResult {
    if (!this.templateModal) {
      return html`Modal missing template.`;
    }

    return html` <div class="le__modal__content__template">
      ${this.templateModal()}
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

    const selectiveConfig = merge(
      {},
      // Clone to prevent shared values if editor changes config.
      cloneSelectiveConfig(
        this.config.selectiveConfig as LiveEditorSelectiveEditorConfig
      ),
      {
        // For smaller forms, like in modals, delay the validation
        // until after the form has been submitted.
        delayValidation: true,
      }
    );

    // Clone to prevent shared values if editor changes config.
    this.selective = new SelectiveEditor(selectiveConfig);

    // When the project type is updated the selective editor changes.
    this.config.state.addListener(
      StatePromiseKeys.SetProjectType,
      (projectType: ProjectTypeComponent) => {
        updateSelectiveForProjectType(projectType, this.selective);
        this.render();
      }
    );
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

  templateContent(): TemplateResult {
    return html`<div class="le__modal__content">
      ${this.templateHeader()} ${this.templateTemplate()}
      ${templateApiError(this.error, {pad: true})} ${this.templateFooter()}
    </div>`;
  }
}
