import {TemplateResult, html} from 'lit-html';
import {BaseUI} from '.';
import {LiveEditor} from '../editor';
import {LiveTemplate} from '../template';
import {UuidMixin} from '@blinkk/selective-edit/dist/src/mixins/uuid';
import {expandClasses} from '@blinkk/selective-edit/dist/src/utility/dom';

export interface ModalConfig {
  classes?: Array<string>;
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
      <div class="live_editor__modal__container">
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
