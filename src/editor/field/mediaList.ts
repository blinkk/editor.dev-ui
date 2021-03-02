import {
  Base,
  DeepObject,
  Field,
  FieldComponent,
  FieldConfig,
  SelectiveEditor,
  SortableFieldComponent,
  SortableMixin,
  TemplateResult,
  Types,
  UuidMixin,
  autoDeepObject,
  classMap,
  html,
  repeat,
} from '@blinkk/selective-edit';
import {MediaFieldComponent, MediaFieldConfig} from './media';
import {EVENT_UNLOCK} from '@blinkk/selective-edit/dist/src/selective/events';
import {LiveEditorGlobalConfig} from '../editor';

const DEFAULT_FIELD_CONFIG: MediaFieldConfig = {
  type: 'media',
  key: '',
  label: 'Media',
};

export interface MediaListFieldConfig extends FieldConfig {
  /**
   * Label for adding more list items.
   */
  addLabel?: string;
  /**
   * Label for when the list is empty.
   */
  emptyLabel?: string;
  /**
   * Field definition for the media field.
   */
  fieldConfig?: MediaFieldConfig;
}

export interface MediaListFieldComponent extends FieldComponent {
  /**
   * Can the list add more items?
   */
  allowAdd?: boolean;
  /**
   * Can the list remove items?
   */
  allowRemove?: boolean;
  /**
   * Handle expanding an item.
   *
   * @param item List item
   */
  expandItem(item: MediaListItemComponent): void;
  /**
   * Event handler for deleting items.
   *
   * @param evt Click event from delete action.
   * @param index Item index being deleted.
   */
  handleDeleteItem(evt: Event, index: number): void;
  /**
   * Number of items in the list.
   */
  length: number;
}

export interface MediaListItemComponent {
  listField: MediaListFieldComponent & SortableFieldComponent;
  mediaField: MediaFieldComponent;
  isExpanded: boolean;
  template: (
    editor: SelectiveEditor,
    data: DeepObject,
    index: number
  ) => TemplateResult;
  uid: string;
}

export interface MediaListItemConstructor {
  new (
    listField: MediaListFieldComponent & SortableFieldComponent,
    mediaField: MediaFieldComponent
  ): MediaListItemComponent;
}

export class MediaListField
  extends SortableMixin(Field)
  implements MediaListFieldComponent {
  config: MediaListFieldConfig;
  globalConfig: LiveEditorGlobalConfig;
  protected items: Array<MediaListItemComponent> | null;
  protected MediaListItemCls: MediaListItemConstructor;
  usingAutoFields: boolean;

  constructor(
    types: Types,
    config: MediaListFieldConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'mediaList'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
    this.globalConfig = globalConfig;
    this.items = null;
    this.usingAutoFields = false;
    this.MediaListItemCls = MediaListFieldItem;
    this.sortableUi.listeners.add('sort', this.handleSort.bind(this));
  }

  get allowAdd(): boolean {
    // Check if validation rules allow for adding more items.
    const value = this.value;
    for (const rule of this.rules.getRulesForZone()) {
      if (!rule.allowAdd(value)) {
        return false;
      }
    }
    return true;
  }

  get allowRemove(): boolean {
    // Check if validation rules allow for removing items.
    const value = this.value;
    for (const rule of this.rules.getRulesForZone()) {
      if (!rule.allowRemove(value)) {
        return false;
      }
    }
    return true;
  }

  protected ensureItems(
    editor: SelectiveEditor
  ): Array<MediaListItemComponent> {
    if (this.items === null) {
      this.items = [];
      const fieldConfig = this.config.fieldConfig || DEFAULT_FIELD_CONFIG;

      // Add list items for each of the values in the list already.
      for (const value of this.originalValue || []) {
        const newField = this.types.fields.newFromKey(
          fieldConfig.type,
          this.types,
          fieldConfig,
          this.globalConfig
        ) as MediaFieldComponent;
        newField.updateOriginal(editor, autoDeepObject(value));
        this.items.push(new this.MediaListItemCls(this, newField));
      }
    }

    return this.items;
  }

  expandItem(item: MediaListItemComponent) {
    for (const otherItem of this.items || []) {
      otherItem.isExpanded = false;
    }
    item.isExpanded = true;
    this.render();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleAddItem(evt: Event, editor: SelectiveEditor, data: DeepObject) {
    const items = this.ensureItems(editor);
    const fieldConfig = this.config.fieldConfig || DEFAULT_FIELD_CONFIG;
    const newField = this.types.fields.newFromKey(
      fieldConfig.type,
      this.types,
      fieldConfig,
      this.globalConfig
    ) as MediaFieldComponent;
    newField.updateOriginal(editor, new DeepObject());
    const newItem = new MediaListFieldItem(this, newField);
    items.push(newItem);
    this.expandItem(newItem);
  }

  handleDeleteItem(evt: Event, index: number) {
    const items = this.items || [];
    // Prevent the delete from bubbling.
    evt.stopPropagation();

    // Remove the value at the index.
    items.splice(index, 1);

    // Lock the fields to prevent array issues when the original value
    // is updated next render.
    this.lock();

    // Unlock fields after saving is complete to let the values be updated
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

    this.render();
  }

  handleSort(startIndex: number, endIndex: number) {
    // Rework the arrays to have the items in the correct position.
    const newListItems: Array<MediaListItemComponent> = [];
    const oldListItems: Array<MediaListItemComponent> = this.items || [];
    const maxIndex = Math.max(endIndex, startIndex);
    const minIndex = Math.min(endIndex, startIndex);

    // Determine which direction to shift misplaced items.
    let modifier = 1;
    if (startIndex > endIndex) {
      modifier = -1;
    }

    for (let i = 0; i < oldListItems.length; i++) {
      if (i < minIndex || i > maxIndex) {
        // Leave in the same order.
        newListItems[i] = oldListItems[i];
      } else if (i === endIndex) {
        // This element is being moved to, place the moved value here.
        newListItems[i] = oldListItems[startIndex];
      } else {
        // Shift the old index using the modifier to determine direction.
        newListItems[i] = oldListItems[i + modifier];
      }
    }

    this.items = newListItems;
    this.lock();

    // Unlock fields after saving is complete to let the values be updated
    // when clean.
    document.addEventListener(
      EVENT_UNLOCK,
      () => {
        this.unlock();
        this.render();
      },
      {once: true}
    );

    this.render();
  }

  get isClean(): boolean {
    // If there are no items, nothing has changed.
    if (this.items === null) {
      return true;
    }

    // When locked, the field is automatically considered dirty.
    if (this.isLocked) {
      return false;
    }

    // Check for a change in length.
    if (this.originalValue && this.originalValue.length !== this.items.length) {
      return false;
    }

    // Check if all of the items are clean.
    for (const item of this.items || []) {
      if (!item.mediaField.isClean) {
        return false;
      }
    }

    return true;
  }

  get isValid(): boolean {
    // If there are no items, nothing has changed.
    if (this.items === null) {
      return true;
    }

    for (const item of this.items) {
      if (!item.mediaField.isValid) {
        return false;
      }
    }
    return true;
  }

  /**
   * Length of the list.
   */
  get length(): number {
    return this.items?.length || 0;
  }

  templateAdd(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    if (!this.allowAdd) {
      return html``;
    }

    return html`<div
      class="selective__media_list__add"
      @click=${(evt: Event) => {
        this.handleAddItem(evt, editor, data);
      }}
    >
      <div class="selective__media_list__add__icon">
        <span class="material-icons">image</span>
      </div>
      <div class="selective__media_list__add__label">
        ${this.config.addLabel || 'Add media'}
      </div>
    </div>`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateEmpty(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    if (this.length > 0) {
      return html``;
    }

    return html` <div
      class="selective__media_list__item selective__media_list__item--empty"
      data-index="0"
    >
      ${this.config.emptyLabel || 'No items in list'}
    </div>`;
  }

  templateInput(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    const items = this.ensureItems(editor);
    return html`${this.templateHelp(editor, data)}
      <div class="selective__media_list">
        ${repeat(
          items || [],
          item => item.uid,
          (item, index) => {
            const itemValue = new DeepObject(
              index < this.originalValue?.length || 0
                ? this.originalValue[index]
                : 'TODO: Default value?'
            );
            return item.template(editor, itemValue, index);
          }
        )}
        ${this.templateEmpty(editor, data)}${this.templateAdd(editor, data)}
      </div>
      ${this.templateErrors(editor, data)}`;
  }

  get value() {
    // Return the original value if the items have never been initialized.
    if (this.items === null) {
      return this.originalValue || [];
    }

    const value = [];
    for (const item of this.items) {
      value.push(item.mediaField.value);
    }
    return value;
  }
}

class MediaListFieldItem
  extends UuidMixin(Base)
  implements MediaListItemComponent {
  listField: MediaListFieldComponent & SortableFieldComponent;
  mediaField: MediaFieldComponent;
  isExpanded: boolean;

  constructor(
    listField: MediaListFieldComponent & SortableFieldComponent,
    mediaField: MediaFieldComponent
  ) {
    super();
    this.listField = listField;
    this.mediaField = mediaField;
    this.isExpanded = false;
  }

  handleCollapseItem() {
    this.isExpanded = false;
    this.listField.render();
  }

  handleExpandItem() {
    this.listField.expandItem(this);
  }

  template(
    editor: SelectiveEditor,
    data: DeepObject,
    index: number
  ): TemplateResult {
    if (this.isExpanded) {
      return this.templateExpanded(editor, data, index);
    }
    return this.templateCollapsed(editor, data, index);
  }

  templateCollapsed(
    editor: SelectiveEditor,
    data: DeepObject,
    index: number
  ): TemplateResult {
    // Need to update the original value on the collapsed items.
    this.mediaField.updateOriginal(editor, data);

    const canDrag = this.listField.length > 1;
    const sortable = this.listField.sortableUi;
    const postActions = [];

    postActions.push(this.templateRemove(editor, data, index));

    return html` <div
      class=${classMap({
        selective__media_list__item: true,
        'selective__media_list__item--collapsed': true,
        'selective__media_list__item--no-drag': this.listField.length <= 1,
        selective__sortable: true,
      })}
      draggable=${canDrag ? 'true' : 'false'}
      data-index=${index}
      @dragenter=${sortable.handleDragEnter.bind(sortable)}
      @dragleave=${sortable.handleDragLeave.bind(sortable)}
      @dragover=${sortable.handleDragOver.bind(sortable)}
      @dragstart=${sortable.handleDragStart.bind(sortable)}
      @drop=${sortable.handleDrop.bind(sortable)}
    >
      <div
        class="selective__media_list__item__preview"
        data-item-uid=${this.uid}
        @click=${this.handleExpandItem.bind(this)}
      >
        ${this.mediaField.templatePreviewMedia(editor, data)}
      </div>
      <div class="selective__field__actions selective__field__actions--post">
        ${postActions}
      </div>
    </div>`;
  }

  templateExpanded(
    editor: SelectiveEditor,
    data: DeepObject,
    index: number
  ): TemplateResult {
    const sortable = this.listField.sortableUi;
    return html` <div
      class="selective__media_list__item selective__media_list__item--expanded selective__sortable"
      data-index=${index}
      @dragenter=${sortable.handleDragEnter.bind(sortable)}
      @dragleave=${sortable.handleDragLeave.bind(sortable)}
      @dragover=${sortable.handleDragOver.bind(sortable)}
      @drop=${sortable.handleDrop.bind(sortable)}
    >
      <div
        class="selective__media_list__fields__header"
        @click=${this.handleCollapseItem.bind(this)}
      >
        <span class="material-icons">keyboard_arrow_down</span>
        ${this.mediaField.templatePreviewValue(editor, data, index)}
      </div>
      <div class="selective__media_list__fields">
        ${this.mediaField.template(editor, data)}
      </div>
    </div>`;
  }

  templateRemove(
    editor: SelectiveEditor,
    data: DeepObject,
    index: number
  ): TemplateResult {
    if (!this.listField.allowRemove) {
      return html``;
    }

    return html`<div
      class="selective__action selective__action--delete selective__tooltip--bottom-left"
      data-item-uid=${this.uid}
      @click=${(evt: Event) => {
        this.listField.handleDeleteItem(evt, index);
      }}
      aria-label="Delete item"
      data-tip="Delete item"
    >
      <i class="material-icons icon icon--delete">remove_circle</i>
    </div>`;
  }
}
