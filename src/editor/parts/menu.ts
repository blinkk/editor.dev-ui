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
    // TODO: Create a modal for the menu.
    return new Modal();
  }

  template(editor: LiveEditor): TemplateResult {
    if (!this.isDocked) {
      if (!editor.parts.modals.modals[MODAL_KEY]) {
        editor.parts.modals.modals[MODAL_KEY] = this.createModal();
      }

      // Let the modal handle the display of the menu.
      return html``;
    }
    return html`<div>Menu Docked...</div>`;
  }
}
