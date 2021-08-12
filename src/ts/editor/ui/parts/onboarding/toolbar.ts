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
      <div class="le__part__onboarding__actions">
        ${this.config.editor.ui.partNotifications.template()}
        ${this.templateAccount()}
      </div>
    </div>`;
  }

  templateAccount(): TemplateResult {
    const authentication =
      this.config.editor.state.authenticationOrGetAuthentication();

    if (!authentication?.usesAccounts || !this.config.editor.api.checkAuth()) {
      return html``;
    }

    const handleAccountClick = () => {
      this.config.editor.api
        .clearAuth()
        .then(() => {
          // Redirect to homepage after signing out.
          window.location.href = '/';
        })
        .catch(err => {
          console.error('Unable to sign out!', err);
        });
    };

    return html`<div
      class="le__part__onboarding__account le__clickable le__tooltip--bottom-left"
      @click=${handleAccountClick}
      data-tip="Sign out"
    >
      <span class="material-icons">logout</span>
    </div>`;
  }
}
