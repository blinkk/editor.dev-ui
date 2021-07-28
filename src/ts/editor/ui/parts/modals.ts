import {BasePart, UiPartComponent, UiPartConfig} from '.';
import {TemplateResult, html} from '@blinkk/selective-edit';
import {Modal} from '../modal';
import {repeat} from '@blinkk/selective-edit';

export type ModalsPartConfig = UiPartConfig;

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
export class ModalsPart extends BasePart implements UiPartComponent {
  modals: Record<string, Modal>;

  constructor() {
    super();
    this.modals = {};
  }

  template(): TemplateResult {
    const keys = Object.keys(this.modals).sort();
    return html`${repeat(
      keys,
      (key: string) => key,
      (key: string) => this.modals[key].template()
    )}`;
  }
}
