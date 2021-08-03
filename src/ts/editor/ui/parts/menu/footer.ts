import {BasePart, UiPartComponent, UiPartConfig} from '..';
import {EditorState, Schemes} from '../../../state';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';
import {UrlConfig, UrlLevel} from '../../../api';

import {DataStorage} from '../../../../utility/dataStorage';

const STORAGE_EXPANDED_KEY = 'live.content.isExpanded';

export interface MenuFooterPartConfig extends UiPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  /**
   * Storage class for working with settings.
   */
  storage: DataStorage;
}

export class MenuFooterPart extends BasePart implements UiPartComponent {
  config: MenuFooterPartConfig;
  isExpanded?: boolean;

  constructor(config: MenuFooterPartConfig) {
    super();
    this.config = config;
    this.isExpanded = this.config.storage.getItemBoolean(STORAGE_EXPANDED_KEY);
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__menu__footer: true,
    };
  }

  getIconForUrl(url: UrlConfig): string {
    if (url.level === UrlLevel.Public) {
      return 'public';
    }
    if (url.level === UrlLevel.Protected) {
      return 'vpn_lock';
    }
    if (url.level === UrlLevel.Source) {
      return 'source';
    }
    return 'lock';
  }

  template(): TemplateResult {
    return html`<div class=${classMap(this.classesForPart())}>
      <div class="le__part__menu__footer__icons">
        ${this.templateActionScheme()}
      </div>
      <!-- Spacing is based on text, not icons. -->
      <!-- Need some text to use for spacing. -->
      <div class="le__part__menu__footer__label">&nbsp;</div>
    </div>`;
  }

  templateActionScheme(): TemplateResult {
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
    const icon = currentMode === Schemes.Dark ? 'light_mode' : 'dark_mode';
    const tip = `${toggleMode} mode`;

    return html`<div
      class="le__part__menu__action le__clickable le__tooltip--top-right"
      @click=${() => {
        this.config.state.setScheme(toggleMode);
        this.render();
      }}
      data-tip=${tip}
    >
      <span class="material-icons">${icon}</span>
    </div>`;
  }
}
