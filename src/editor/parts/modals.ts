import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../editor';
import {Part} from '.';

/**
 * Modals are centralized in the display to be outside of other
 * modals and structures. Modal windows live as siblings in the
 * DOM.
 *
 * This helps to prevent issues where one modal is clipping
 * another without having to pass the modal through the template
 * stack to be outside of another modal.
 */
export class ModalsPart implements Part {
  template(editor: LiveEditor): TemplateResult {
    return html`Modals`;
  }
}
