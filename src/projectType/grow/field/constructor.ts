import {
  DeepObject,
  Field,
  FieldComponent,
  FieldConfig,
  SelectiveEditor,
  TemplateResult,
  Types,
  classMap,
  html,
} from '@blinkk/selective-edit';
import {DEFAULT_ZONE_KEY} from '@blinkk/selective-edit/dist/src/selective/validation';
import {LiveEditorGlobalConfig} from '../../../editor/editor';

export interface GrowConstructorConfig extends FieldConfig {
  /**
   * Placeholder for the text input.
   */
  placeholder?: string;
}

export interface GrowConstructorComponent extends FieldComponent {
  config: GrowConstructorConfig;
}

export class GrowConstructorField
  extends Field
  implements GrowConstructorComponent {
  config: GrowConstructorConfig;
  tag: string;
  globalConfig: LiveEditorGlobalConfig;

  constructor(
    types: Types,
    config: GrowConstructorConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'constructor'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
    this.globalConfig = globalConfig;
    this.tag = 'g.constructor';

    // Workaround to validate the constructor value without
    // having to have a complex validation structure in the config.
    this.zoneToKey = {};
    this.zoneToKey[DEFAULT_ZONE_KEY] = 'value';
  }

  /**
   * Handle when the input changes value.
   *
   * @param evt Input event from changing value.
   */
  handleInput(evt: Event) {
    const target = evt.target as HTMLInputElement;

    if (target.value.trim() === '') {
      this.currentValue = null;
    } else {
      this.currentValue = {
        tag: this.tag,
        value: target.value,
      };
    }
    this.render();
  }

  templateInput(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    const value = this.currentValue || '';

    return html`${this.templateHelp(editor, data)}
      <div class=${classMap(this.classesForInput())}>
        <input
          type="text"
          id="${this.uid}"
          placeholder=${this.config.placeholder || ''}
          @input=${this.handleInput.bind(this)}
          value=${value}
        />
      </div>
      ${this.templateErrors(editor, data)}`;
  }
}
