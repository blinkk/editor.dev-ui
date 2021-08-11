import {ContentSectionPart, ContentSectionPartConfig} from './section';
import {DeepObject, TemplateResult} from '@blinkk/selective-edit';

import {EVENT_RENDER_COMPLETE, EVENT_SAVE} from '../../../events';
import {EditorFileData} from '../../../api';
import {StatePromiseKeys} from '../../../state';
import {UnknownField} from '../../../field/unknown';
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

    // Custom field for unknown fields.
    this.selective.types.fields.DefaultCls = UnknownField as any;
  }

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

    const value: Record<string, any> = merge({}, this.config.state.file || {});
    // Do not 'merge' the data as it will get merged with the original data
    // instead of overwritten.
    value.data = this.selective.value;

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
    this.selective.data = this.data;

    const fields = this.config.state.file?.editor?.fields || [];
    if (!fields.length) {
      this.selective.guessFields();
    } else {
      this.selective.fields.reset();
      for (const fieldConfig of fields) {
        this.selective.fields.addField(fieldConfig);
      }
    }

    this.render();
  }

  get section(): string {
    return 'fields';
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
