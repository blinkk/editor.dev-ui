import {ContentSectionPart, ContentSectionPartConfig} from './section';
import {
  DeepObject,
  TemplateResult,
  TextAreaFieldConfig,
} from '@blinkk/selective-edit';

import {EVENT_RENDER_COMPLETE, EVENT_SAVE} from '../../../events';
import {EditorFileData} from '../../../api';
import {StatePromiseKeys} from '../../../state';

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
    this.isProcessing = true;
    this.render();

    // The first time the editor is marked for validation the values cannot be trusted.
    // The render step needs to complete before the validation can be trusted.
    if (!this.selective.markValidation) {
      // Mark the selective editor for all field validation.
      // For UX the validation is not run until the user interacts with a
      // field or when they try to 'submit'.
      this.selective.markValidation = true;

      document.addEventListener(
        EVENT_RENDER_COMPLETE,
        () => {
          this.handleAction(evt);
        },
        {
          once: true,
        }
      );

      this.render();
      return;
    }

    if (this.selective.isClean || !this.selective.isValid) {
      this.isProcessing = false;
      this.render();
      return;
    }

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
    this.selective.fields.reset();

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

  templateContent(): TemplateResult {
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
