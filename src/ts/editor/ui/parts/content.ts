import {BasePart, LazyUiParts, UiPartComponent, UiPartConfig} from '.';
import {ContentFooterConfig, ContentFooterPart} from './content/footer';
import {ContentHeaderConfig, ContentHeaderPart} from './content/header';
import {ContentSectionPart, ContentSectionPartConfig} from './content/section';
import {ContentToolbarConfig, ContentToolbarPart} from './content/toolbar';
import {
  EditorConfig,
  TemplateResult,
  classMap,
  html,
  repeat,
} from '@blinkk/selective-edit';
import {EditorState, StatePromiseKeys} from '../../state';

import {Base} from '@blinkk/selective-edit/dist/mixins';
import {DataStorage} from '../../../utility/dataStorage';
import {FieldsPart} from './content/sectionFields';
import {HistoryPart} from './content/sectionHistory';
import {ListenersMixin} from '../../../mixin/listeners';
import {MediaPart} from './content/sectionMedia';
import {RawPart} from './content/sectionRaw';
import {templateLoading} from '../../template';

const STORAGE_SETTING_HIGHLIGHT_AUTO = 'live.content.dev.hightlightAuto';
const STORAGE_SETTING_HIGHLIGHT_DIRTY = 'live.content.dev.hightlightDirty';
const STORAGE_SETTING_SHOW_DEEP_LINKS = 'live.content.dev.showDeepLinks';

export const CONTENT_SECTION_ORDER = [
  'fields',
  // TODO: Media part does not do anything yet.
  // 'media',
  'raw',
  'history',
];

export interface ContentPartConfig extends UiPartConfig {
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

/**
 * Ui part for displaying the content of a file.
 *
 * The content is broken up into sections which are displayed individually.
 * For example, the fields editor, raw editor, or content history.
 */
export class ContentPart extends BasePart implements UiPartComponent {
  config: ContentPartConfig;
  contentSettings: ContentSettings;
  parts: LazyUiParts;
  sections: LazyUiParts;

  constructor(config: ContentPartConfig) {
    super();

    this.config = config;
    this.contentSettings = new ContentSettings(this.config.storage);

    this.sections = new LazyUiParts();

    this.sections.register('fields', FieldsPart, {
      editor: this.config.editor,
      selectiveConfig: this.config.selectiveConfig,
      state: this.config.state,
      isDefaultSection: true,
      storage: this.config.storage,
    } as ContentSectionPartConfig);
    this.sections.register('media', MediaPart, {
      editor: this.config.editor,
      selectiveConfig: this.config.selectiveConfig,
      state: this.config.state,
      storage: this.config.storage,
    } as ContentSectionPartConfig);
    this.sections.register('raw', RawPart, {
      editor: this.config.editor,
      selectiveConfig: this.config.selectiveConfig,
      state: this.config.state,
      storage: this.config.storage,
    } as ContentSectionPartConfig);
    this.sections.register('history', HistoryPart, {
      editor: this.config.editor,
      selectiveConfig: this.config.selectiveConfig,
      state: this.config.state,
      storage: this.config.storage,
    } as ContentSectionPartConfig);

    this.parts = new LazyUiParts();

    this.parts.register('footer', ContentFooterPart, {
      editor: this.config.editor,
      contentSettings: this.contentSettings,
    } as ContentFooterConfig);
    this.parts.register('header', ContentHeaderPart, {
      editor: this.config.editor,
      sections: this.sections,
      state: this.config.state,
      storage: this.config.storage,
    } as ContentHeaderConfig);
    this.parts.register('toolbar', ContentToolbarPart, {
      editor: this.config.editor,
      state: this.config.state,
      storage: this.config.storage,
    } as ContentToolbarConfig);
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__panel: true,
      le__part__content: true,
    };
  }

  get isExpanded(): boolean {
    return this.partToolbar.isExpanded || false;
  }

  get partFooter(): ContentFooterPart {
    return this.parts.get('footer') as ContentFooterPart;
  }

  get partHeader(): ContentHeaderPart {
    return this.parts.get('header') as ContentHeaderPart;
  }

  get partToolbar(): ContentToolbarPart {
    return this.parts.get('toolbar') as ContentToolbarPart;
  }

  template(): TemplateResult {
    const subParts: Array<TemplateResult> = [];

    subParts.push(this.partToolbar.template());

    if (this.config.editor.state.loadingFilePath) {
      subParts.push(html`<div class="le__part__content__loading">
        ${templateLoading(
          {},
          html`<div class="le__part__content__loading__status">
            Loading
            <code>${this.config.editor.state.loadingFilePath || 'file'}</code>
          </div>`
        )}
      </div>`);
    } else {
      subParts.push(this.partHeader.template());
      subParts.push(this.templateSections());
    }

    subParts.push(this.partFooter.template());

    return html`<div class=${classMap(this.classesForPart())}>
      ${subParts}
    </div>`;
  }

  templateSections(): TemplateResult {
    const visibleSections: Array<ContentSectionPart> = [];
    for (const sectionKey of CONTENT_SECTION_ORDER) {
      const section: ContentSectionPart = this.sections.get(
        sectionKey
      ) as ContentSectionPart;
      visibleSections.push(section);
    }

    return html`<div class="le__part__content__sections">
      ${repeat(
        visibleSections,
        section => section.section,
        section => section.template()
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
