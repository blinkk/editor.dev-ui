import {TemplateResult, html} from 'lit-html';
import {BaseUI} from '.';
import {LiveEditor} from '../editor';
import {LiveTemplate} from '../template';
import {UuidMixin} from '@blinkk/selective-edit/dist/src/mixins/uuid';
import {
  expandClasses,
  findParentByClassname,
} from '@blinkk/selective-edit/dist/src/utility/dom';

export interface ModalConfig {
  classes?: Array<string>;
  canClickToCloseFunc?: () => boolean;
}

export class Modal extends UuidMixin(BaseUI) {
  config: ModalConfig;
  isVisible: boolean;
  modalTemplate?: LiveTemplate;

  constructor(config: ModalConfig) {
    super();
    this.config = config;
    this.isVisible = false;
  }

  classesForModal(): Array<string> {
    const classes: Array<string> = ['live_editor__modal'];

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
      'live_editor__modal__content'
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

    if (!this.modalTemplate) {
      return html`Modal missing template.`;
    }

    return html`<div class=${expandClasses(this.classesForModal())}>
      <div
        class="live_editor__modal__container"
        @click=${this.handleOffClick.bind(this)}
      >
        <div class="live_editor__modal__content">
          ${this.modalTemplate(editor)}
        </div>
      </div>
    </div>`;
  }

  toggle() {
    this.isVisible = !this.isVisible;
    this.render();
  }
}
