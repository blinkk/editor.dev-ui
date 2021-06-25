import {
  AutocompleteConstructorField,
  ConstructorConfig,
} from '../../generic/field/constructor';
import {
  DeepObject,
  SelectiveEditor,
  TemplateResult,
  Types,
  html,
} from '@blinkk/selective-edit';
import {AutoCompleteUIItem} from '../../../mixin/autocomplete';
import {DataType} from '@blinkk/selective-edit/dist/utility/dataType';
import {EVENT_UNLOCK} from '@blinkk/selective-edit/dist/selective/events';
import {LiveEditorGlobalConfig} from '../../../editor/editor';
import merge from 'lodash.merge';

export type GrowStringConfig = ConstructorConfig;

interface StringInfo {
  reference: string;
  value: string;
  podPath: string;
}

export class GrowStringField extends AutocompleteConstructorField {
  config: GrowStringConfig;
  globalConfig: LiveEditorGlobalConfig;

  constructor(
    types: Types,
    config: GrowStringConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'string'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
    this.globalConfig = globalConfig;
    this.type = 'g.string';

    // The string field allows for arbitrary strings, so if there are
    // no matches and there is a value, hide the autocomplete.
    this.autoCompleteUi.shouldShowEmpty = (value: string) => {
      if (DataType.isString(value) && value.trim() !== '') {
        return false;
      }
      return true;
    };

    this.initItems();
  }

  convertItems(podPathToValue: Record<string, any>): Array<StringInfo> {
    const stringInfos: Array<StringInfo> = [];

    for (const [podPath, value] of Object.entries(podPathToValue)) {
      const deepValue = new DeepObject(value);
      const podPathParts = podPath.split('/');
      const baseKey = podPathParts[podPathParts.length - 1].replace(
        /\.yaml$/,
        ''
      );

      for (const key of deepValue.keys()) {
        stringInfos.push({
          reference: `${baseKey}.${key}`,
          value: deepValue.get(key),
          podPath: podPath,
        });
      }
    }

    return stringInfos;
  }

  initItems() {
    // Check for already loaded strings.
    this.updateItems(
      this.convertItems(this.globalConfig.state.projectTypes.grow.strings || {})
    );

    // Listen for changes to the strings.
    this.globalConfig.state.projectTypes.grow.addListener(
      'getStrings',
      strings => {
        this.updateItems(this.convertItems(strings));
        this.render();
      }
    );

    // Load the strings if not loaded.
    if (this.globalConfig.state.projectTypes.grow.strings === undefined) {
      this.globalConfig.state.projectTypes.grow.getStrings();
    }
    this.render();
  }

  setCurrentValue(value: any) {
    if (DataType.isString(value) && value.trim() === '') {
      this.currentValue = null;
    } else {
      value = value.trim();

      // Check if the value is one of the string references.
      let reference: string | undefined = undefined;

      for (const item of this.autoCompleteUi.items || []) {
        if (item.value === value) {
          reference = item.value;
          break;
        }
      }

      if (reference) {
        // Store as constructor value.
        this.currentValue = merge(
          {},
          DataType.isObject(this.currentValue) ? this.currentValue : {},
          {
            _type: this.type,
            _data: value,
          }
        );
      } else {
        // Store as arbitrary string.
        this.currentValue = value;
      }
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

  /**
   * Template for showing the preview of the strings value since the value
   * in the input is the reference for the string.
   */
  templateValuePreview(
    editor: SelectiveEditor,
    data: DeepObject
  ): TemplateResult {
    const value = this.currentValue || {};

    if (!DataType.isObject(value) || !value._data) {
      return html``;
    }

    let previewValue = value._data;

    for (const item of this.autoCompleteUi.items || []) {
      if (item.value === value._data) {
        previewValue = item.label;
        break;
      }
    }

    return html`<div class="selective__field__type__string__preview">
      Preview: <span>${previewValue}</span>
    </div>`;
  }

  updateItems(documentFiles: Array<StringInfo>) {
    this.autoCompleteUi.items = documentFiles.map(
      value => new StringUIItem(value.reference, value.value, value.podPath)
    );
  }
}

class StringUIItem extends AutoCompleteUIItem {
  podPath: string;

  constructor(value: string, label: string, podPath: string) {
    super(value, label);
    this.podPath = podPath;
  }

  templateItem(
    editor: SelectiveEditor,
    index: number,
    isSelected: boolean,
    handleClick: (evt: Event) => void
  ): TemplateResult {
    return html` <div
      aria-selected=${isSelected ? 'true' : 'false'}
      class="selective__autocomplete__list__item"
      role="option"
      tabindex="-1"
      data-index=${index}
      data-value=${this.value}
      @click=${handleClick}
    >
      <div class="selective__autocomplete__list__item__label">
        ${this.label}
      </div>
      <div class="selective__autocomplete__list__item__meta">${this.value}</div>
    </div>`;
  }
}
