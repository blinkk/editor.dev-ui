import {BasePart, Part} from '.';
import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../editor';
import {Modal} from '../ui/modal';
import {repeat} from 'lit-html/directives/repeat';

/**
 * Modals are centralized in the display to be outside of other
 * modals and structures. Modal windows live as siblings in the
 * DOM.
 *
 * This helps to prevent issues where one modal is clipping
 * another without having to pass the modal through the template
 * stack to be outside of another modal.
 *
 * This also allows reuse of modals across parts of the editor.
 */
export class ModalsPart extends BasePart implements Part {
  modals: Record<string, Modal>;

  constructor() {
    super();
    this.modals = {};
  }

  template(editor: LiveEditor): TemplateResult {
    const keys = Object.keys(this.modals).sort();
    return html`${repeat(
      keys,
      (key: string) => key,
      (key: string) => html`${this.modals[key].uid}`
    )}`;
  }
}
