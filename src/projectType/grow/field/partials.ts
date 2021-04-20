import {
  DeepObject,
  FieldConfig,
  FieldsComponent,
  ListField,
  ListItemComponent,
  SelectiveEditor,
  SortableFieldComponent,
  TemplateResult,
  Types,
  autoDeepObject,
  html,
} from '@blinkk/selective-edit';
import {GrowPartialData} from '../../../editor/api';
import {
  ListFieldComponent,
  ListFieldItem,
} from '@blinkk/selective-edit/dist/src/selective/field/list';
import {LiveEditorGlobalConfig} from '../../../editor/editor';
import {templateLoading} from '../../../editor/template';

export interface GrowPartialsFieldComponent {
  partials?: Record<string, GrowPartialData>;
}

export interface GrowPartialsFieldConfig extends FieldConfig {
  /**
   * Label for adding more list items.
   */
  addLabel?: string;
  /**
   * Label for when the list is empty.
   */
  emptyLabel?: string;
}

export class GrowPartialsField extends ListField {
  config: GrowPartialsFieldConfig;
  globalConfig: LiveEditorGlobalConfig;
  partials?: Record<string, GrowPartialData>;

  constructor(
    types: Types,
    config: GrowPartialsFieldConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'grow_partials'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
    this.globalConfig = globalConfig;
    this.ListItemCls = GrowPartialListFieldItem;
    this.partials = this.globalConfig.state.projectTypes.grow.partials;
    this.globalConfig.state.projectTypes.grow.addListener(
      'getPartials',
      partials => {
        this.partials = partials;
        this.items = null;
        this.render();
      }
    );

    // Load the partials if not loaded.
    if (this.partials === undefined) {
      this.globalConfig.state.projectTypes.grow.getPartials();
    }
  }

  /**
   * Does the list allow for showing simple fields?
   */
  get allowSimple(): boolean {
    return false;
  }

  protected ensureItems(editor: SelectiveEditor): Array<ListItemComponent> {
    if (this.items === null) {
      this.items = [];

      // While waiting for the partials to load, there are no items.
      if (this.partials === undefined) {
        return this.items;
      }

      // Add list items for each of the values in the list already.
      for (const value of this.originalValue || []) {
        const partialKey = value.partial;
        if (!partialKey) {
          console.error('No partial key found in partial data.', value);
          continue;
        }

        const partial = this.partials[partialKey];
        if (!partial) {
          console.error(
            'No partial found in partials.',
            partialKey,
            this.partials
          );
          continue;
        }

        let fieldConfigs = partial.editor?.fields || [];

        // If no partial editor config, auto guess based on the value.
        if (fieldConfigs.length === 0) {
          this.usingAutoFields = true;

          // Auto-guess fields based on the first item in the list.
          const autoFields = new this.types.globals.AutoFieldsCls({});
          fieldConfigs = autoFields.guessFields(value);
        }

        const fields = this.createFields(fieldConfigs);

        // When an item is not expanded it does not get the value
        // updated correctly so we need to manually call the data update.
        fields.updateOriginal(editor, value);
        for (const field of fields.fields) {
          field.updateOriginal(
            editor,
            autoDeepObject(value || fields.guessDefaultValue())
          );
        }

        this.items.push(new this.ListItemCls(this, fields));
      }
    }

    return this.items;
  }

  templateInput(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    // While waiting for the partials config show the loading indicator.
    if (!this.partials) {
      return templateLoading(editor, {
        pad: true,
      });
    }
    return super.templateInput(editor, data);
  }
}

class GrowPartialListFieldItem extends ListFieldItem {
  listField: GrowPartialsFieldComponent &
    ListFieldComponent &
    SortableFieldComponent;

  constructor(
    listField: GrowPartialsFieldComponent &
      ListFieldComponent &
      SortableFieldComponent,
    fields: FieldsComponent
  ) {
    super(listField, fields);
    this.listField = listField;
    this.fields = fields;
  }

  /**
   * Template for how to render a preview.
   *
   * @param editor Selective editor used to render the template.
   * @param data Data provided to render the template.
   */
  templatePreviewValue(
    editor: SelectiveEditor,
    data: DeepObject,
    index?: number
  ): TemplateResult {
    const partialItem = (this.listField.originalValue as Array<any>)[
      index || 0
    ];
    const partialKey = partialItem?.partial;
    if (partialKey && this.listField.partials) {
      const partial = this.listField.partials[partialKey];
      if (partial.editor?.label) {
        return html`${partial.editor?.label}`;
      }
    }

    return super.templatePreviewValue(editor, data, index);
  }
}
