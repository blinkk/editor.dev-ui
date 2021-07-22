import {ContentSectionPart, ContentSectionPartConfig} from './section';
import {
  DeepObject,
  TemplateResult,
  TextAreaFieldConfig,
} from '@blinkk/selective-edit';
import {EVENT_FILE_LOAD_COMPLETE, EVENT_SAVE} from '../../events';
import {EditorFileData} from '../../api';
import {LiveEditor} from '../../editor';
import {StatePromiseKeys} from '../../state';

const EXTENSIONS_DATA_ONLY: Array<string> = ['yaml', 'yml'];
const RAW_FIELD_CONTENT: TextAreaFieldConfig = {
  type: 'textarea',
  key: 'content',
  label: 'Content',
  wrap: 'hard',
};
const RAW_FIELD_DATA: TextAreaFieldConfig = {
  type: 'textarea',
  key: 'dataRaw',
  label: 'Data',
  wrap: 'hard',
};

export class RawPart extends ContentSectionPart {
  data: DeepObject;

  constructor(config: ContentSectionPartConfig) {
    super(config);
    this.data = new DeepObject();

    this.loadEditorConfig();

    this.config.state.addListener(
      StatePromiseKeys.GetFile,
      (file?: EditorFileData) => {
        if (file) {
          this.selective.data = file.data || {};
          this.loadEditorConfig();
        }
      }
    );

    document.addEventListener(EVENT_SAVE, (evt: Event) => {
      // If the section is not visible, then disregard the event.
      if (this.isVisible) {
        this.handleAction(evt);
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleAction(evt: Event) {
    if (this.selective.isClean || !this.selective.isValid) {
      return;
    }

    this.isProcessing = true;
    this.render();
    this.config.state.saveFile(
      this.selective.value as EditorFileData,
      true,
      () => {
        this.isProcessing = false;
        this.render();
      }
    );
  }

  get label() {
    return 'Source';
  }

  loadEditorConfig() {
    this.data = new DeepObject(this.config.state.file || {});
    this.selective.data = this.data;

    const extension = this.config.state.file?.file.path.split('.').pop() || '';
    if (EXTENSIONS_DATA_ONLY.includes(extension)) {
      this.selective.fields.addField(RAW_FIELD_DATA);
    } else {
      this.selective.fields.addField(RAW_FIELD_DATA);
      this.selective.fields.addField(RAW_FIELD_CONTENT);
    }
    this.render();
  }

  get section(): string {
    return 'raw';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateContent(editor: LiveEditor): TemplateResult {
    const isValid = this.selective.isValid;
    try {
      return this.selective.template(this.selective, this.data);
    } finally {
      if (isValid !== this.selective.isValid) {
        this.render();
      }
    }
  }
}
