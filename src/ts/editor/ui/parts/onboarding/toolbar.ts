import {BasePart, UiPartComponent, UiPartConfig} from '..';
import {TemplateResult, classMap, html, repeat} from '@blinkk/selective-edit';
import {OnboardingBreadcrumbs} from '../onboarding';

export interface ToolbarOnboardingPartConfig extends UiPartConfig {
  breadcrumbs: OnboardingBreadcrumbs;
}

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
      <div class="le__part__onboarding__breadcrumb">
        <div class="le__part__onboarding__toolbar__title">
          <a href="/start/">Editor.dev</a>
        </div>
        ${repeat(
          this.config.breadcrumbs.crumbs,
          crumb => crumb.label,
          crumb => {
            return html`<div
              class=${classMap({
                le__part__onboarding__breadcrumb__item: true,
                le__clickable: crumb.handleClick !== undefined,
              })}
              @click=${(evt: Event) => {
                if (crumb.handleClick) {
                  crumb.handleClick(evt);
                }
              }}
            >
              ${crumb.label || html`&nbsp;`}
            </div>`;
          }
        )}
      </div>
      ${this.config.editor.ui.partNotifications.template()}
    </div>`;
  }
}
