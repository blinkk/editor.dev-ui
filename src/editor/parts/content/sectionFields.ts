import {ContentSectionPart, ContentSectionPartConfig} from './section';
import {
  DeepObject,
  EditorConfig,
  SelectiveEditor,
  TemplateResult,
} from '@blinkk/selective-edit';
import {EVENT_FILE_LOAD_COMPLETE} from '../../events';
import {LiveEditor} from '../../editor';

export interface FieldsPartConfig extends ContentSectionPartConfig {
  /**
   * Configuration for creating the selective editor.
   */
  selectiveConfig: EditorConfig;
}

export class FieldsPart extends ContentSectionPart {
  config: FieldsPartConfig;
  data: DeepObject;
  selective: SelectiveEditor;

  constructor(config: FieldsPartConfig) {
    super(config);
    this.config = config;
    this.data = new DeepObject();
    this.selective = new SelectiveEditor(this.config.selectiveConfig);

    this.loadEditorConfig();

    document.addEventListener(EVENT_FILE_LOAD_COMPLETE, () => {
      this.loadEditorConfig();
    });
  }

  classesForAction(): Array<string> {
    const classes = super.classesForAction();

    // TODO: Base the button classes on the form status.
    classes.push('le__button--primary');

    return classes;
  }

  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__content__fields');
    return classes;
  }

  get isActionDisabled(): boolean {
    return this.isProcessing || !this.selective.isValid;
  }

  get label(): string {
    return 'Fields';
  }

  labelForAction(): string {
    // TODO: Base label on the state of the form.
    if (this.isProcessing) {
      return 'Saving';
    }

    return 'Save changes';
  }

  loadEditorConfig() {
    this.data = new DeepObject(this.config.state.file?.data || {});
    this.selective.resetFields();
    for (const fieldConfig of this.config.state.file?.editor.fields || []) {
      this.selective.fields.addField(fieldConfig);
    }
    this.render();
  }

  get section(): string {
    return 'fields';
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return this.selective.template(this.selective, this.data);
  }
}
