import {TemplateResult, html, render} from '@blinkk/selective-edit';

import {EVENT_RENDER_COMPLETE} from '../../editor/events';
import {LiveEditorApiComponent} from '../../editor/api';
import {ServerApiComponent} from '../api';

export class ServiceOnboarding {
  api: LiveEditorApiComponent & ServerApiComponent;
  container: HTMLElement;
  renderContainer?: HTMLElement;
  isPendingRender?: boolean;
  isRendering?: boolean;
  service = 'Service';

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

    if (!this.renderContainer) {
      // Allow for the rendering to be inside of a marketing page.
      this.renderContainer = (this.container.querySelector(
        `.service-${this.service.toLowerCase()}`
      ) || this.container) as HTMLElement;
    }

    render(this.template(this), this.renderContainer);

    this.isRendering = false;
    document.dispatchEvent(new CustomEvent(EVENT_RENDER_COMPLETE));

    if (this.isPendingRender) {
      this.render();
    }
  }

  template(onboarding: ServiceOnboarding): TemplateResult {
    return html`<div class="onboarding">
      ${onboarding.service} onboarding...
    </div>`;
  }
}
