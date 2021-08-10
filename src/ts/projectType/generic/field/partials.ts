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
} from '@blinkk/selective-edit/dist/selective/field/list';
import {LiveEditor, LiveEditorGlobalConfig} from '../../../editor/editor';
import {
  combinePreviewKeys,
  findPreviewValue,
} from '@blinkk/selective-edit/dist/utility/preview';

import {EVENT_UNLOCK} from '@blinkk/selective-edit/dist/selective/events';
import {PartialData} from '../../../editor/api';
import cloneDeep from 'lodash.clonedeep';
import merge from 'lodash.merge';
import {templateLoading} from '../../../editor/template';

const MODAL_KEY_NEW = 'partials_new';

export interface GenericPartialsFieldConfig extends FieldConfig {
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

export interface GenericPartialsFieldComponent {
  partials?: Record<string, PartialData>;
}

export class GenericPartialsField
  extends ListField
  implements GenericPartialsFieldComponent
{
  config: GenericPartialsFieldConfig;
  globalConfig: LiveEditorGlobalConfig;
  partials?: Record<string, PartialData>;
  selective?: SelectiveEditor;

  constructor(
    types: Types,
    config: GenericPartialsFieldConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'partials'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
    this.globalConfig = globalConfig;
    this.ListItemCls = GenericPartialListFieldItem;
    this.initPartials();
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
          const autoFields = new this.types.globals.AutoFieldsCls({
            ignoreKeys: ['partial'],
          });
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
    selectiveEditor: SelectiveEditor
  ): FormDialogModal {
    const editor = this.globalConfig.editor as LiveEditor;
    if (!editor.ui.partModals.modals[MODAL_KEY_NEW]) {
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
        {},
        // Clone to prevent shared values if editor changes config.
        cloneDeep(editor.config.selectiveConfig),
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
        }
      );
      const modal = new FormDialogModal({
        title: this.config.addLabel || 'Add partial',
        selectiveConfig: selectiveConfig,
        state: this.globalConfig.state,
      });

      // Show an error when there are no partial configs for the editor.
      if (!options.length) {
        modal.error = {
          message: 'Unable to find partial editor configurations.',
        };
      }

      modal.templateModal = (): TemplateResult => {
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

          const partialConfig = this.partials[value.partial] as PartialData;
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
      editor.ui.partModals.modals[MODAL_KEY_NEW] = modal;
    }
    return editor.ui.partModals.modals[MODAL_KEY_NEW] as FormDialogModal;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleAddItem(evt: Event, editor: SelectiveEditor, data: DeepObject) {
    const modal = this.getOrCreateModalNew(editor);
    modal.show();
  }

  initPartials() {
    throw new Error('Not implemented.');
  }

  templateFooter(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    if (!this.partials) {
      return html``;
    }

    return super.templateFooter(editor, data);
  }

  templateInput(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    // While waiting for the partials config show the loading indicator.
    if (!this.partials) {
      return templateLoading({
        pad: true,
      });
    }
    return super.templateInput(editor, data);
  }
}

class GenericPartialListFieldItem extends ListFieldItem {
  listField: GenericPartialsFieldComponent &
    ListFieldComponent &
    SortableFieldComponent;

  constructor(
    listField: GenericPartialsFieldComponent &
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
        combinePreviewKeys(
          partial.editor?.previewFields,
          partial.editor?.previewField
        ),
        ''
      );

      if (partial.editor?.label) {
        return html`${partial.editor?.label}
        ${previewValue ? html`<span>${previewValue}</span>` : ''}`;
      }
      return html`${partialKey}`;
    }

    return super.templatePreviewValue(editor, data, index);
  }
}
