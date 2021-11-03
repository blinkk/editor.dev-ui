import {
  DeepObject,
  Field,
  FieldComponent,
  FieldConfig,
  MatchRuleConfig,
  RuleConfig,
  SelectiveEditor,
  TemplateResult,
  Types,
  classMap,
  html,
} from '@blinkk/selective-edit';
import {AutoCompleteMixin} from '../../../mixin/autocomplete';
import {DEFAULT_ZONE_KEY} from '@blinkk/selective-edit/dist/selective/validation';
import {DataType} from '@blinkk/selective-edit/dist/utility/dataType';
import {EVENT_UNLOCK} from '@blinkk/selective-edit/dist/selective/events';
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
    this.zones = {};
    this.zones[DEFAULT_ZONE_KEY] = {
      key: '_data',
    };
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

  /**
   * Check if the data format is invalid for what the field expects to edit.
   */
  get isDataFormatValid(): boolean {
    if (this.originalValue === undefined || this.originalValue === null) {
      return true;
    }

    return DataType.isObject(this.originalValue);
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
  implements ConstructorComponent
{
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

    // Support aritrary field values.
    const inputValue =
      value._data !== undefined
        ? value._data // Value is from a yaml tag.
        : DataType.isString(value)
        ? value // Value is an arbitrary string
        : '';

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
          .value=${inputValue}
        />
        ${this.autoCompleteUi.templateList(editor, inputValue)}
        ${this.templateValuePreview(editor, data)}
      </div>
      ${this.templateErrors(editor, data)}`;
  }

  /**
   * Template for showing a preview specific to the value of the field.
   */
  templateValuePreview(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    editor: SelectiveEditor,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: DeepObject
  ): TemplateResult {
    return html``;
  }

  /**
   * When using the autocomplete, a field can require that the value be part of
   * the available options to be valid.
   *
   * @param validValues Values that are valid for the field.
   * @param errorMessage Error message shown when the value is not valid.
   */
  updateValidation(validValues: Array<string | RegExp>, errorMessage: string) {
    if (!this.config.validation) {
      // If there is no validation, default to a zone based to support the constructor _data.
      this.config.validation = {} as Record<string, Array<RuleConfig>>;
      this.config.validation[DEFAULT_ZONE_KEY] = [];
    } else if (DataType.isArray(this.config.validation)) {
      // If there are non-zone based validation, convert it to use the zone.
      const originalValidation = this.config.validation as Array<RuleConfig>;
      this.config.validation = {} as Record<string, Array<RuleConfig>>;
      this.config.validation[DEFAULT_ZONE_KEY] = originalValidation;
    }
    const validationZone = (
      this.config.validation as Record<string, Array<RuleConfig>>
    )[DEFAULT_ZONE_KEY];

    const existingIndex = this.listItemValidationRule
      ? validationZone.indexOf(this.listItemValidationRule)
      : -1;

    // Validate the field to ensure that the document is
    // one of the available documents.
    this.listItemValidationRule = {
      type: 'match',
      allowed: {
        message: errorMessage,
        values: validValues,
      },
    } as MatchRuleConfig;

    if (existingIndex >= 0) {
      // Replace the existing rule.
      validationZone[existingIndex] = this.listItemValidationRule;
    } else {
      // Add as new rule.
      validationZone.push(this.listItemValidationRule);
    }

    // Reset the compiled rules.
    this._rules = undefined;
  }
}
