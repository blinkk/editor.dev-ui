import {
  DeepObject,
  Field,
  FieldConfig,
  SelectiveEditor,
  TemplateResult,
  Types,
  html,
  unsafeHTML,
} from '@blinkk/selective-edit';
import {LiveEditorGlobalConfig} from '../editor';
import {marked} from 'marked';

export interface AsideFieldConfig extends FieldConfig {
  /**
   * Source markdown to be converted to html in the editor.
   */
  source: string;
}

export class AsideField extends Field {
  config: AsideFieldConfig;

  constructor(
    types: Types,
    config: AsideFieldConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'aside'
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateStructure(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    return html`${unsafeHTML(marked(this.config.source))}`;
  }
}
