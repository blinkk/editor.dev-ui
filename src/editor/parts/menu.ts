import {BasePart, Part} from '.';
import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../editor';
import {Modal} from '../ui/modal';

const MODAL_KEY = 'menu';

export class MenuPart extends BasePart implements Part {
  isDocked: boolean;

  constructor() {
    super();
    // TODO: Read from local storage.
    this.isDocked = false;
  }

  protected createModal(): Modal {
    const modal = new Modal({
      classes: [
        'live_editor__modal--docked',
        'live_editor__modal--docked-left',
      ],
    });
    modal.modalTemplate = this.templateMenu.bind(this);
    // modal.isVisible = true;
    return modal;
  }

  template(editor: LiveEditor): TemplateResult {
    if (!this.isDocked) {
      if (!editor.parts.modals.modals[MODAL_KEY]) {
        editor.parts.modals.modals[MODAL_KEY] = this.createModal();
      }

      // Let the modal handle the display of the menu.
      return html``;
    }
    return this.templateMenu(editor);
  }

  templateMenu(editor: LiveEditor): TemplateResult {
    return html`Full menu goes here.`;
  }
}
