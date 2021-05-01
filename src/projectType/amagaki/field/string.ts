import {
  ConstructorConfig,
  ConstructorField,
} from '../../generic/field/constructor';
import {
  DeepObject,
  SelectiveEditor,
  TemplateResult,
  Types,
  classMap,
  html,
} from '@blinkk/selective-edit';
import {LiveEditorGlobalConfig} from '../../../editor/editor';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AmagakiStringConfig extends ConstructorConfig {}

export class AmagakiStringField extends ConstructorField {
  config: AmagakiStringConfig;
  globalConfig: LiveEditorGlobalConfig;

  constructor(
    types: Types,
    config: AmagakiStringConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'string'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
    this.globalConfig = globalConfig;
    this.type = 'pod.string';
  }

  /**
   * Handle when the input changes value.
   *
   * @param evt Input event from changing value.
   */
  handleValueInput(evt: Event) {
    const target = evt.target as HTMLInputElement;

    // Need to keep an other keys from other fields.
    const currentValue = this.currentValue || {};
    if (!currentValue._data) {
      currentValue._data = {};
    }
    currentValue._data.value = target.value;
    this.setCurrentValue(currentValue._data);
    this.render();
  }

  get isSimple(): boolean {
    return false;
  }

  templateInput(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    const value = this.currentValue || {};

    return html`${this.templateHelp(editor, data)}
      <div class=${classMap(this.classesForInput())}>
        <input
          type="text"
          id="${this.uid}-value"
          placeholder=${this.config.placeholder || ''}
          @input=${this.handleValueInput.bind(this)}
          value=${value._data?.value || ''}
        />
      </div>
      ${this.templateErrors(editor, data)}`;
  }
}
