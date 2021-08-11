import {
  DeepObject,
  Field,
  FieldConfig,
  SelectiveEditor,
  TemplateResult,
  Types,
  html,
} from '@blinkk/selective-edit';
import {LiveEditorGlobalConfig} from '../editor';
import {templateInfo} from '../template';

export type UnknownFieldConfig = FieldConfig;

export class UnknownField extends Field {
  config: UnknownFieldConfig;

  constructor(
    types: Types,
    config: UnknownFieldConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'unknown'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
  }

  /**
   * Template for determining how to render the field.
   *
   * @param editor Selective editor used to render the template.
   * @param data Data provided to render the template.
   */
  template(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    return this.templateWrapper(editor, data);
  }

  /**
   * Template for rendering the field structure.
   *
   * Used for controlling the order that parts of the field are rendered.
   *
   * @param editor Selective editor used to render the template.
   * @param data Data provided to render the template.
   */
  templateInputStructure(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    editor: SelectiveEditor,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: DeepObject
  ): TemplateResult {
    return html`<div class="selective__field__input__structure">
      ${templateInfo(html`Unable to display this field that is using the
        <code>${this.config.type}</code> field type. Please contact the
        developer to update the editor configuration to use a valid field type.`)}
    </div>`;
  }
}
