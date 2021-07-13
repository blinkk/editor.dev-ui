import {BasePart, Part} from '..';
import {EditorState, Schemes} from '../../state';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';

import {ContentSettings} from '../content';
import {DataStorage} from '../../../utility/dataStorage';
import {LiveEditor} from '../../editor';

export interface ContentFooterConfig {
  contentSettings: ContentSettings;
  state: EditorState;
  storage: DataStorage;
}

export class ContentFooterPart extends BasePart implements Part {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  template(editor: LiveEditor): TemplateResult {
    let currentMode = this.config.state.prefersDarkScheme
      ? Schemes.Dark
      : Schemes.Light;

    if (this.config.state.scheme === Schemes.Dark) {
      currentMode = Schemes.Dark;
    } else if (this.config.state.scheme === Schemes.Light) {
      currentMode = Schemes.Light;
    }

    const toggleMode =
      currentMode === Schemes.Light ? Schemes.Dark : Schemes.Light;

    return html`<div class=${classMap(this.classesForPart())}>
      <div class="le__part__content__dev_tools__icons">
        <div
          class=${classMap({
            le__part__content__dev_tools__icon: true,
            'le__tooltip--top-right': true,
          })}
          @click=${() => {
            this.config.state.setScheme(toggleMode);
            this.render();
          }}
          aria-label="Switch to ${toggleMode} mode"
          aria-role="link"
          data-tip="${toggleMode} mode"
        >
          <span class="material-icons"
            >${currentMode === Schemes.Dark ? 'light_mode' : 'dark_mode'}</span
          >
        </div>
      </div>
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
