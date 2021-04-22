import {ApiError, GrowPartialData} from '../../../editor/api';
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
import {DialogActionLevel, FormDialogModal} from '../../../editor/ui/modal';
import {
  ListFieldComponent,
  ListFieldItem,
} from '@blinkk/selective-edit/dist/src/selective/field/list';
import {LiveEditor, LiveEditorGlobalConfig} from '../../../editor/editor';
import merge from 'lodash.merge';
import {templateLoading} from '../../../editor/template';
import {EVENT_UNLOCK} from '@blinkk/selective-edit/dist/src/selective/events';
import {findPreviewValue} from '@blinkk/selective-edit/dist/src/utility/preview';

const MODAL_KEY_NEW = 'grow_partials_new';

export interface GrowPartialsFieldConfig extends FieldConfig {
  /**
   * Label for adding more list items.
   */
  addLabel?: string;
  /**
   * Label for when the list is empty.
   */
  emptyLabel?: string;
  /**
   * Label for partial.
   */
  partialLabel?: string;
  /**
   * Help text when adding a partial.
   */
  partialHelpLabel?: string;
  /**
   * Required message when adding a partial.
   */
  partialRequireLabel?: string;
}

export interface GrowPartialsFieldComponent {
  partials?: Record<string, GrowPartialData>;
}

export class GrowPartialsField
  extends ListField
  implements GrowPartialsFieldComponent {
  config: GrowPartialsFieldConfig;
  globalConfig: LiveEditorGlobalConfig;
  partials?: Record<string, GrowPartialData>;
  selective?: SelectiveEditor;

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

  protected getOrCreateModalNew(
    editor: LiveEditor,
    selectiveEditor: SelectiveEditor
  ): FormDialogModal {
    if (!editor.parts.modals.modals[MODAL_KEY_NEW]) {
      // Setup the editor.
      const options = [];
      for (const [partialKey, partial] of Object.entries(this.partials || {})) {
        // Without the editor config there are no fields to add for a partial.
        if (!partial.editor) {
          continue;
        }

        options.push({
          label: partial.editor.label || partialKey,
          value: partialKey,
        });
      }

      const selectiveConfig = merge(
        {
          fields: [
            {
              type: 'radio',
              key: 'partial',
              label: this.config.partialLabel || 'Partial',
              help: this.config.partialHelpLabel || 'Choose a partial to add.',
              options: options,
              validation: [
                {
                  type: 'require',
                  message:
                    this.config.partialRequireLabel || 'Partial is required.',
                },
              ],
            },
          ],
        },
        editor.config.selectiveConfig
      );
      const modal = new FormDialogModal({
        title: this.config.addLabel || 'Add partial',
        selectiveConfig: selectiveConfig,
      });

      // Show an error when there are no partial configs for the editor.
      if (!options.length) {
        modal.error = {
          message: 'Unable to find partial editor configurations.',
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      modal.templateModal = (editor: LiveEditor): TemplateResult => {
        const isValid = modal.selective.isValid;
        try {
          return modal.selective.template(modal.selective, modal.data);
        } finally {
          if (isValid !== modal.selective.isValid) {
            this.render();
          }
        }
      };

      modal.actions.push({
        label: this.config.addLabel || 'Add partial',
        level: DialogActionLevel.Primary,
        isDisabledFunc: () => {
          return modal.isProcessing || !modal.selective.isValid;
        },
        isSubmit: true,
        onClick: () => {
          const value = modal.selective.value;
          modal.startProcessing();

          if (!this.partials) {
            console.error('Unable to find partials.');
            modal.stopProcessing();
            return;
          }

          if (!this.items) {
            console.error('Unable to find items.');
            modal.stopProcessing();
            return;
          }

          const partialConfig = this.partials[value.partial] as GrowPartialData;
          const fields = this.createFields(partialConfig.editor?.fields || []);
          fields.updateOriginal(
            selectiveEditor,
            autoDeepObject({
              partial: value.partial,
            })
          );
          // Update original from the
          fields.lock();

          // Unlock fields after saving is complete to let the values be updated
          // when clean.
          // TODO: Automate this unlock without having to be done manually.
          document.addEventListener(
            EVENT_UNLOCK,
            () => {
              fields.unlock();
              this.render();
            },
            {once: true}
          );

          const newItem = new this.ListItemCls(this, fields);
          newItem.isExpanded = true;
          this.items.push(newItem);
          modal.stopProcessing(true);
        },
      });
      modal.addCancelAction();
      editor.parts.modals.modals[MODAL_KEY_NEW] = modal;
    }
    return editor.parts.modals.modals[MODAL_KEY_NEW] as FormDialogModal;
  }

  handleAddItem(evt: Event, editor: SelectiveEditor, data: DeepObject) {
    const modal = this.getOrCreateModalNew(
      this.globalConfig.editor as LiveEditor,
      editor
    );
    modal.show();
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
    const partialValue = this.fields.value;
    const partialKey = partialValue?.partial;
    if (partialKey && this.listField.partials) {
      const partial = this.listField.partials[partialKey];
      const previewValue = findPreviewValue(
        this.fields.value,
        partial.editor?.previewFields || [],
        ''
      );

      if (partial.editor?.label) {
        return html`${partial.editor?.label}
        ${previewValue ? html`<span>${previewValue}</span>` : ''}`;
      }
    }

    return super.templatePreviewValue(editor, data, index);
  }
}
