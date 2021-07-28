import {BasePart, UiPartComponent, UiPartConfig} from '.';
import {TemplateResult, html} from '@blinkk/selective-edit';
import {Toast, ToastConfig} from '../toast';

import {EVENT_TOAST_SHOW} from '../../events';
import {repeat} from '@blinkk/selective-edit';

export type ToastsPartConfig = UiPartConfig;

/**
 * Toasts are centralized in the display to be outside of other
 * modals and structures. Toast elements live as siblings in the
 * DOM.
 */
export class ToastsPart extends BasePart implements UiPartComponent {
  config: ToastsPartConfig;
  toasts: Array<Toast>;

  constructor(config: ToastsPartConfig) {
    super();
    this.config = config;
    this.toasts = [];

    document.addEventListener(EVENT_TOAST_SHOW, (evt: Event) => {
      const newToast = new Toast((evt as CustomEvent).detail as ToastConfig);
      this.toasts.unshift(newToast);
      newToast.show();
    });
  }

  template(): TemplateResult {
    return html`<div class="le__part__toasts">
      ${repeat(
        this.toasts,
        toast => toast.uid,
        toast => toast.template()
      )}
    </div>`;
  }
}

export function showToast(toast: ToastConfig) {
  document.dispatchEvent(new CustomEvent(EVENT_TOAST_SHOW, {detail: toast}));
}
