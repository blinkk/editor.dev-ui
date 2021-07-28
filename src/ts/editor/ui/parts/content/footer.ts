import {BasePart, UiPartComponent, UiPartConfig} from '..';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';

import {ContentSettings} from '../content';

export interface ContentFooterConfig extends UiPartConfig {
  contentSettings: ContentSettings;
}

export class ContentFooterPart extends BasePart implements UiPartComponent {
  config: ContentFooterConfig;

  constructor(config: ContentFooterConfig) {
    super();
    this.config = config;
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__content__footer: true,
    };
  }

  template(): TemplateResult {
    return html`<div class=${classMap(this.classesForPart())}>
      <div class="le__part__content__logo"></div>
      <div class="le__part__content__dev_tools">Developer tools:</div>
      <div class="le__part__content__dev_tools__icons">
        <div
          class=${classMap({
            le__part__content__dev_tools__icon: true,
            'le__part__content__dev_tools__icon--selected':
              this.config.contentSettings.highlightAuto || false,
            'le__tooltip--top': true,
          })}
          @click=${() => {
            this.config.contentSettings.toggleHighlightAuto();
            this.render();
          }}
          aria-label="Highlight auto fields"
          aria-role="link"
          data-tip="Highlight auto fields"
        >
          <span class="material-icons">assistant</span>
        </div>
        <div
          class=${classMap({
            le__part__content__dev_tools__icon: true,
            'le__part__content__dev_tools__icon--selected':
              this.config.contentSettings.showDeepLinks || false,
            'le__tooltip--top': true,
          })}
          @click=${() => {
            this.config.contentSettings.toggleShowDeepLinks();
            this.render();
          }}
          aria-label="Deep link to fields"
          aria-role="link"
          data-tip="Deep link to fields"
        >
          <span class="material-icons">link</span>
        </div>
        <div
          class=${classMap({
            le__part__content__dev_tools__icon: true,
            'le__part__content__dev_tools__icon--selected':
              this.config.contentSettings.highlightDirty || false,
            'le__tooltip--top': true,
          })}
          @click=${() => {
            this.config.contentSettings.toggleHighlightDirty();
            this.render();
          }}
          aria-label="Highlight changed fields"
          aria-role="link"
          data-tip="Highlight changed fields"
        >
          <span class="material-icons">change_history</span>
        </div>
      </div>
    </div>`;
  }
}
