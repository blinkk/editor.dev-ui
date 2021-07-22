import {ContentSectionPart, ContentSectionPartConfig} from './section';
import {DeepObject, TemplateResult} from '@blinkk/selective-edit';
import {EVENT_SAVE} from '../../events';
import {EditorFileData} from '../../api';
import {LiveEditor} from '../../editor';
import {StatePromiseKeys} from '../../state';
import merge from 'lodash.merge';

export class FieldsPart extends ContentSectionPart {
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

    const value: Record<string, any> = merge({}, this.config.state.file || {});
    // Do not 'merge' the data as it will get merged with the original data
    // instead of overwritten.
    value.data = this.selective.value;

    this.isProcessing = true;
    this.render();
    this.config.state.saveFile(value as EditorFileData, false, () => {
      this.isProcessing = false;
      this.render();
    });
  }

  get label(): string {
    return 'Fields';
  }

  loadEditorConfig() {
    this.data = new DeepObject(this.config.state.file?.data || {});
    this.selective.resetFields();

    const fields = this.config.state.file?.editor?.fields || [];
    if (!fields.length) {
      this.selective.guessFields();
    } else {
      for (const fieldConfig of fields) {
        this.selective.fields.addField(fieldConfig);
      }
    }

    this.render();
  }

  get section(): string {
    return 'fields';
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
