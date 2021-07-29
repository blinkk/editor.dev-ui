import {BasePart, UiPartComponent, UiPartConfig} from '..';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';

export type HeaderOnboardingPartConfig = UiPartConfig;

export class HeaderOnboardingPart extends BasePart implements UiPartComponent {
  config: HeaderOnboardingPartConfig;

  constructor(config: HeaderOnboardingPartConfig) {
    super();
    this.config = config;
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__panel: true,
      le__part__onboarding__header: true,
    };
  }

  template(): TemplateResult {
    return html`<div class=${classMap(this.classesForPart())}>
      <div class="le__part__onboarding__header__title">
        <a href="/">editor.dev</a>
      </div>
      ${this.config.editor.ui.partNotifications.template()}
    </div>`;
  }
}
