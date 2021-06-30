import {TemplateResult, html, render} from '@blinkk/selective-edit';

import {EVENT_RENDER_COMPLETE} from '../../editor/events';
import {LiveEditorApiComponent} from '../../editor/api';
import {ServerApiComponent} from '../api';

export class ServiceOnboarding {
  api: LiveEditorApiComponent & ServerApiComponent;
  container: HTMLElement;
  isPendingRender?: boolean;
  isRendering?: boolean;

  constructor(
    container: HTMLElement,
    api: LiveEditorApiComponent & ServerApiComponent
  ) {
    this.container = container;
    this.api = api;
  }

  render() {
    if (this.isRendering) {
      this.isPendingRender = true;
      return;
    }
    this.isPendingRender = false;
    this.isRendering = true;

    render(this.template(this), this.container);

    this.isRendering = false;
    document.dispatchEvent(new CustomEvent(EVENT_RENDER_COMPLETE));

    if (this.isPendingRender) {
      this.render();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  template(onboarding: ServiceOnboarding): TemplateResult {
    return html`<div>TODO: onboarding UI test...</div>`;
  }
}
