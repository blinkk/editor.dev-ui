import {BasePart, UiPartComponent, UiPartConfig} from '..';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';

export type ToolbarOnboardingPartConfig = UiPartConfig;

export class ToolbarOnboardingPart extends BasePart implements UiPartComponent {
  config: ToolbarOnboardingPartConfig;

  constructor(config: ToolbarOnboardingPartConfig) {
    super();
    this.config = config;
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__panel: true,
      le__part__onboarding__toolbar: true,
    };
  }

  template(): TemplateResult {
    return html`<div class=${classMap(this.classesForPart())}>
      <div class="le__part__onboarding__toolbar__title">
        <a href="/">editor.dev</a>
      </div>
      ${this.config.editor.ui.partNotifications.template()}
    </div>`;
  }
}
