import {BasePart, Part} from '.';
import {
  EditorConfig,
  TemplateResult,
  classMap,
  html,
  repeat,
} from '@blinkk/selective-edit';
import {Base} from '@blinkk/selective-edit/dist/src/mixins';
import {ContentFooterPart} from './content/footer';
import {ContentHeaderPart} from './content/header';
import {ContentSectionPart} from './content/section';
import {ContentToolbarPart} from './content/toolbar';
import {EVENT_FILE_LOAD} from '../events';
import {EditorState} from '../state';
import {FieldsPart} from './content/sectionFields';
import {FileData} from '../api';
import {HistoryPart} from './content/sectionHistory';
import {ListenersMixin} from '../../mixin/listeners';
import {LiveEditor} from '../editor';
import {MediaPart} from './content/sectionMedia';
import {RawPart} from './content/sectionRaw';
import {Storage} from '../../utility/storage';

const STORAGE_SETTING_HIGHLIGHT_AUTO = 'live.content.dev.hightlightAuto';
const STORAGE_SETTING_HIGHLIGHT_DIRTY = 'live.content.dev.hightlightDirty';
const STORAGE_SETTING_SHOW_DEEP_LINKS = 'live.content.dev.showDeepLinks';

export interface ContentPartConfig {
  /**
   * Configuration for creating the selective editor.
   */
  selectiveConfig: EditorConfig;
  state: EditorState;
  /**
   * Storage class for working with settings.
   */
  storage: Storage;
}

export interface ContentParts {
  footer: ContentFooterPart;
  header: ContentHeaderPart;
  toolbar: ContentToolbarPart;
}

export class ContentPart extends BasePart implements Part {
  config: ContentPartConfig;
  contentSettings: ContentSettings;
  parts: ContentParts;
  sections: Array<ContentSectionPart>;

  constructor(config: ContentPartConfig) {
    super();

    this.config = config;
    this.contentSettings = new ContentSettings(this.config.storage);

    // Order of appearance.
    this.sections = [
      new FieldsPart({
        selectiveConfig: this.config.selectiveConfig,
        state: this.config.state,
        isDefaultSection: true,
        storage: this.config.storage,
      }),
      new MediaPart({
        selectiveConfig: this.config.selectiveConfig,
        state: this.config.state,
        storage: this.config.storage,
      }),
      new RawPart({
        selectiveConfig: this.config.selectiveConfig,
        state: this.config.state,
        storage: this.config.storage,
      }),
      new HistoryPart({
        selectiveConfig: this.config.selectiveConfig,
        state: this.config.state,
        storage: this.config.storage,
      }),
    ];

    this.parts = {
      footer: new ContentFooterPart({
        contentSettings: this.contentSettings,
        storage: this.config.storage,
      }),
      header: new ContentHeaderPart({
        sections: this.sections,
        state: this.config.state,
        storage: this.config.storage,
      }),
      toolbar: new ContentToolbarPart({
        state: this.config.state,
        storage: this.config.storage,
      }),
    };

    // Watch for a load file event and load the file.
    document.addEventListener(EVENT_FILE_LOAD, (evt: Event) => {
      const customEvent: CustomEvent = evt as CustomEvent;
      this.config.state.getFile(customEvent.detail as FileData);
    });
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__content: true,
    };
  }

  get isExpanded(): boolean {
    return this.parts.toolbar.isExpanded || false;
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${classMap(this.classesForPart())}>
      ${this.parts.toolbar.template(editor)}
      ${this.parts.header.template(editor)} ${this.templateSections(editor)}
      ${this.parts.footer.template(editor)}
    </div>`;
  }

  templateSections(editor: LiveEditor): TemplateResult {
    return html`<div class="le__part__content__sections">
      ${repeat(
        this.sections,
        part => part.section,
        part => part.template(editor)
      )}
    </div>`;
  }
}

export class ContentSettings extends ListenersMixin(Base) {
  protected _highlightAuto?: boolean;
  protected _highlightDirty?: boolean;
  protected _showDeepLinks?: boolean;
  storage: Storage;

  constructor(storage: Storage) {
    super();
    this.storage = storage;
    this._highlightAuto = this.storage.getItemBoolean(
      STORAGE_SETTING_HIGHLIGHT_AUTO
    );
    this._highlightDirty = this.storage.getItemBoolean(
      STORAGE_SETTING_HIGHLIGHT_DIRTY
    );
    this._showDeepLinks = this.storage.getItemBoolean(
      STORAGE_SETTING_SHOW_DEEP_LINKS
    );
  }

  get highlightAuto(): boolean {
    return this._highlightAuto || false;
  }

  set highlightAuto(value: boolean) {
    this._highlightAuto = value;
    this.storage.setItemBoolean(STORAGE_SETTING_HIGHLIGHT_AUTO, value);
    this.triggerListener('highlightAuto', this.highlightAuto);
  }

  get highlightDirty(): boolean {
    return this._highlightDirty || false;
  }

  set highlightDirty(value: boolean) {
    this._highlightDirty = value;
    this.storage.setItemBoolean(STORAGE_SETTING_HIGHLIGHT_DIRTY, value);
    this.triggerListener('highlightDirty', this.highlightDirty);
  }

  get showDeepLinks(): boolean {
    return this._showDeepLinks || false;
  }

  set showDeepLinks(value: boolean) {
    this._showDeepLinks = value;
    this.storage.setItemBoolean(STORAGE_SETTING_SHOW_DEEP_LINKS, value);
    this.triggerListener('showDeepLinks', this.showDeepLinks);
  }

  toggleHighlightAuto() {
    this.highlightAuto = !this.highlightAuto;
  }

  toggleHighlightDirty() {
    this.highlightDirty = !this.highlightDirty;
  }

  toggleShowDeepLinks() {
    this.showDeepLinks = !this.showDeepLinks;
  }
}
