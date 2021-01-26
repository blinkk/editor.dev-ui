import {BasePart, Part} from '.';
import {
  TemplateResult,
  expandClasses,
  html,
  repeat,
} from '@blinkk/selective-edit';
import {ContentFooterPart} from './content/footer';
import {ContentHeaderPart} from './content/header';
import {ContentSectionPart} from './content/index';
import {ContentToolbarPart} from './content/toolbar';
import {EVENT_FILE_LOAD} from '../events';
import {EditorState} from '../state';
import {FieldsPart} from './content/sectionFields';
import {FileData} from '../api';
import {HistoryPart} from './content/sectionHistory';
import {LiveEditor} from '../editor';
import {MediaPart} from './content/sectionMedia';
import {RawPart} from './content/sectionRaw';
import {Storage} from '../../utility/storage';

export interface ContentPartConfig {
  state: EditorState;
  storage: Storage;
}

export interface ContentParts {
  footer: ContentFooterPart;
  header: ContentHeaderPart;
  toolbar: ContentToolbarPart;
}

export class ContentPart extends BasePart implements Part {
  config: ContentPartConfig;
  parts: ContentParts;
  sections: Array<ContentSectionPart>;

  constructor(config: ContentPartConfig) {
    super();

    this.config = config;

    // Order of appearance.
    this.sections = [
      new FieldsPart({
        state: this.config.state,
        isDefaultSection: true,
        storage: this.config.storage,
      }),
      new MediaPart({
        state: this.config.state,
        storage: this.config.storage,
      }),
      new RawPart({
        state: this.config.state,
        storage: this.config.storage,
      }),
      new HistoryPart({
        state: this.config.state,
        storage: this.config.storage,
      }),
    ];

    this.parts = {
      footer: new ContentFooterPart({}),
      header: new ContentHeaderPart({
        sections: this.sections,
        state: this.config.state,
        storage: this.config.storage,
      }),
      toolbar: new ContentToolbarPart({}),
    };

    // Watch for a load file event and load the file.
    document.addEventListener(EVENT_FILE_LOAD, (evt: Event) => {
      const customEvent: CustomEvent = evt as CustomEvent;
      this.config.state.loadFile(customEvent.detail as FileData);
    });
  }

  classesForPart(): Array<string> {
    const classes = ['le__part__content'];
    return classes;
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${expandClasses(this.classesForPart())}>
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
