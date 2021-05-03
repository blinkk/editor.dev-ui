import {
  DeepObject,
  Field,
  FieldComponent,
  FieldConfig,
  RuleConfig,
  SelectiveEditor,
  TemplateResult,
  Types,
  classMap,
  html,
} from '@blinkk/selective-edit';
import {AutoCompleteMixin} from '../../../mixin/autocomplete';
import {DEFAULT_ZONE_KEY} from '@blinkk/selective-edit/dist/src/selective/validation';
import {DataType} from '@blinkk/selective-edit/dist/src/utility/dataType';
import {EVENT_UNLOCK} from '@blinkk/selective-edit/dist/src/selective/events';
import {LiveEditorGlobalConfig} from '../../../editor/editor';
import merge from 'lodash.merge';

export interface ConstructorConfig extends FieldConfig {
  /**
   * Placeholder for the text input.
   */
  placeholder?: string;
}

export interface ConstructorComponent extends FieldComponent {
  config: ConstructorConfig;
}

export class ConstructorField extends Field implements ConstructorComponent {
  config: ConstructorConfig;
  /**
   * Yaml type. ex: `constructor` => `!constructor`
   */
  type: string;
  globalConfig: LiveEditorGlobalConfig;

  constructor(
    types: Types,
    config: ConstructorConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'constructor'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
    this.globalConfig = globalConfig;
    this.type = 'constructor';

    // Workaround to validate the constructor value without
    // having to have a complex validation structure in the config.
    this.zoneToKey = {};
    this.zoneToKey[DEFAULT_ZONE_KEY] = '_data';
  }

  /**
   * Handle when the input changes value.
   *
   * @param evt Input event from changing value.
   */
  handleInput(evt: Event) {
    const target = evt.target as HTMLInputElement;
    this.setCurrentValue(target.value);
    this.render();
  }

  setCurrentValue(value: any) {
    if (DataType.isString(value) && value.trim() === '') {
      this.currentValue = null;
    } else {
      this.currentValue = merge({}, this.currentValue || {}, {
        _type: this.type,
        _data: value,
      });
    }

    this.lock();

    // Unlock after saving is complete to let the values be updated
    // when clean.
    // TODO: Automate this unlock without having to be done manually.
    document.addEventListener(
      EVENT_UNLOCK,
      () => {
        this.unlock();
        this.render();
      },
      {once: true}
    );
  }

  templateInput(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    const value = this.currentValue || {};

    return html`${this.templateHelp(editor, data)}
      <div class=${classMap(this.classesForInput())}>
        <input
          type="text"
          id="${this.uid}"
          placeholder=${this.config.placeholder || ''}
          @input=${this.handleInput.bind(this)}
          .value=${value._data || ''}
        />
      </div>
      ${this.templateErrors(editor, data)}`;
  }
}

export class AutocompleteConstructorField
  extends AutoCompleteMixin(ConstructorField)
  implements ConstructorComponent {
  /**
   * When validating that the value needs to be part of list items
   * keep track of the validation rule config. When the list items
   * change the validation rule should be updated to have the correct
   * options.
   */
  protected listItemValidationRule?: RuleConfig;

  constructor(
    types: Types,
    config: ConstructorConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'constructor'
  ) {
    super(types, config, globalConfig, fieldType);

    // Update the value for the field when an autocomplete value is selected.
    this.autoCompleteUi.addListener('select', value => {
      this.setCurrentValue(value);
      this.render();
    });
  }

  /**
   * Handle when the input changes value.
   *
   * @param evt Input event from changing value.
   */
  handleInput(evt: Event) {
    const target = evt.target as HTMLInputElement;

    this.setCurrentValue(target.value);

    // Refresh the filter list options when the value has changed.
    this.autoCompleteUi.filter(target.value);

    this.render();
  }

  templateInput(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    const value = this.currentValue || {};

    return html`${this.templateHelp(editor, data)}
      <div class=${classMap(this.classesForInput())}>
        <input
          aria-autocomplete="list"
          aria-expanded="false"
          autocapitalize="none"
          autocomplete="off"
          role="combobox"
          type="text"
          id="${this.uid}"
          placeholder=${this.config.placeholder || ''}
          @input=${this.handleInput.bind(this)}
          @focus=${this.autoCompleteUi.handleFocus.bind(this.autoCompleteUi)}
          @keydown=${this.autoCompleteUi.handleInputKeyDown.bind(
            this.autoCompleteUi
          )}
          @keyup=${this.autoCompleteUi.handleInputKeyUp.bind(
            this.autoCompleteUi
          )}
          .value=${value._data || ''}
        />
        ${this.autoCompleteUi.templateList(editor)}
      </div>
      ${this.templateErrors(editor, data)}`;
  }
}
