import {BasePart, Part} from '.';
import {
  EditorConfig,
  TemplateResult,
  classMap,
  html,
  repeat,
} from '@blinkk/selective-edit';
import {Base} from '@blinkk/selective-edit/dist/mixins';
import {ContentFooterPart} from './content/footer';
import {ContentHeaderPart} from './content/header';
import {ContentSectionPart} from './content/section';
import {ContentToolbarPart} from './content/toolbar';
import {DataStorage} from '../../utility/dataStorage';
import {EditorState, StatePromiseKeys} from '../state';
import {FieldsPart} from './content/sectionFields';
import {HistoryPart} from './content/sectionHistory';
import {ListenersMixin} from '../../mixin/listeners';
import {LiveEditor} from '../editor';
// import {MediaPart} from './content/sectionMedia';
import {RawPart} from './content/sectionRaw';
import {templateLoading} from '../template';

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
  storage: DataStorage;
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
      // TODO: Media part does not do anything yet.
      // new MediaPart({
      //   selectiveConfig: this.config.selectiveConfig,
      //   state: this.config.state,
      //   storage: this.config.storage,
      // }),
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
    const subParts: Array<TemplateResult> = [];

    subParts.push(this.parts.toolbar.template(editor));

    if (editor.state.inProgress(StatePromiseKeys.GetFile)) {
      subParts.push(html`<div class="le__part__content__loading">
        ${templateLoading(
          {},
          html`<div class="le__part__content__loading__status">
            Loading
            <code>${editor.state.loadingFilePath || 'file'}</code>
          </div>`
        )}
      </div>`);
    } else {
      subParts.push(this.parts.header.template(editor));
      subParts.push(this.templateSections(editor));
    }

    subParts.push(this.parts.footer.template(editor));

    return html`<div class=${classMap(this.classesForPart())}>
      ${subParts}
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
  storage: DataStorage;

  constructor(storage: DataStorage) {
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
