import {ContentSectionPart, ContentSectionPartConfig} from './section';
import {DeepObject, TemplateResult, html} from '@blinkk/selective-edit';
import {EVENT_FILE_LOAD_COMPLETE} from '../../events';
import {LiveEditor} from '../../editor';

export class FieldsPart extends ContentSectionPart {
  data: DeepObject;

  constructor(config: ContentSectionPartConfig) {
    super(config);
    this.data = new DeepObject();

    this.loadEditorConfig();

    document.addEventListener(EVENT_FILE_LOAD_COMPLETE, () => {
      this.loadEditorConfig();
    });
  }

  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__content__fields');
    return classes;
  }

  get label(): string {
    return 'Fields';
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
