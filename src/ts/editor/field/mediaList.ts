import {
  Base,
  DataType,
  DeepObject,
  DroppableMixin,
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
import {
  MediaFieldComponent,
  MediaFieldConfig,
  VALID_IMAGE_MIME_TYPES,
  VALID_VIDEO_MIME_TYPES,
} from './media';
import {EVENT_UNLOCK} from '@blinkk/selective-edit/dist/selective/events';
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
  /**
   * Override the default media upload provider to determine if the upload
   * should be remote.
   */
  remote?: boolean;
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
  extends DroppableMixin(SortableMixin(Field))
  implements MediaListFieldComponent
{
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
    this.droppableUi.validTypes = this.config.fieldConfig?.accepted || [
      ...VALID_IMAGE_MIME_TYPES,
      ...VALID_VIDEO_MIME_TYPES,
    ];
    this.droppableUi.listeners.add('files', this.handleFiles.bind(this));
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
      const fieldConfig =
        this.config.fieldConfig ||
        Object.assign(
          {
            remote: this.config.remote,
          },
          DEFAULT_FIELD_CONFIG
        );

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
    const fieldConfig =
      this.config.fieldConfig ||
      Object.assign(
        {
          remote: this.config.remote,
        },
        DEFAULT_FIELD_CONFIG
      );
    const newField = this.types.fields.newFromKey(
      fieldConfig.type,
      this.types,
      fieldConfig,
      this.globalConfig
    ) as MediaFieldComponent;
    newField.updateOriginal(editor, new DeepObject());

    // When adding a new item to a locked field
    if (this.isLocked) {
      newField.lock();

      // Unlock fields after saving is complete to let the values be updated
      // when clean.
      // TODO: Automate this unlock without having to be done manually.
      document.addEventListener(
        EVENT_UNLOCK,
        () => {
          newField.unlock();
        },
        {once: true}
      );
    }

    const newItem = new this.MediaListItemCls(this, newField);
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
    const downstreamItems = items.slice(index);
    for (const item of downstreamItems) {
      item.mediaField.lock();
    }
    this.lock();

    // Unlock fields after saving is complete to let the values be updated
    // when clean.
    // TODO: Automate this unlock without having to be done manually.
    document.addEventListener(
      EVENT_UNLOCK,
      () => {
        for (const item of downstreamItems) {
          item.mediaField.unlock();
        }
        this.unlock();
        this.render();
      },
      {once: true}
    );

    this.render();
  }

  handleFiles(files: Array<File>) {
    // Create a new item for each file uploaded.
    const items = this.items || [];
    for (const file of files) {
      const fieldConfig = this.config.fieldConfig || DEFAULT_FIELD_CONFIG;
      const newField = this.types.fields.newFromKey(
        fieldConfig.type,
        this.types,
        fieldConfig,
        this.globalConfig
      ) as MediaFieldComponent;
      const newItem = new this.MediaListItemCls(this, newField);
      items.push(newItem);
      newField.handleFiles([file]);
    }
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

        // Lock the fields to prevent the values from being updated at the same
        // time as the original value.
        newListItems[i].mediaField.lock();
      } else if (i === endIndex) {
        // This element is being moved to, place the moved value here.
        newListItems[i] = oldListItems[startIndex];

        // Lock the fields to prevent the values from being updated at the same
        // time as the original value.
        newListItems[i].mediaField.lock();
      } else {
        // Shift the old index using the modifier to determine direction.
        newListItems[i] = oldListItems[i + modifier];

        // Lock the fields to prevent the values from being updated at the same
        // time as the original value.
        newListItems[i].mediaField.lock();
      }
    }

    this.items = newListItems;
    this.lock();

    // Unlock fields after saving is complete to let the values be updated
    // when clean.
    document.addEventListener(
      EVENT_UNLOCK,
      () => {
        for (const item of newListItems) {
          item.mediaField.unlock();
        }
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

  /**
   * Check if the data format is invalid for what the field expects to edit.
   */
  get isDataFormatValid(): boolean {
    if (this.originalValue === undefined || this.originalValue === null) {
      return true;
    }

    return DataType.isArray(this.originalValue);
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
      class="selective__media_list__add selective__droppable__target"
      @click=${(evt: Event) => {
        this.handleAddItem(evt, editor, data);
      }}
      @dragenter=${this.droppableUi.handleDragEnter.bind(this.droppableUi)}
      @dragleave=${this.droppableUi.handleDragLeave.bind(this.droppableUi)}
      @dragover=${this.droppableUi.handleDragOver.bind(this.droppableUi)}
      @drop=${this.droppableUi.handleDrop.bind(this.droppableUi)}
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
    if (this.length > 0 || this.allowAdd) {
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
              index < this.currentValue?.length || 0
                ? this.currentValue[index]
                : {}
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
  implements MediaListItemComponent
{
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
    const droppable = this.mediaField.droppableUi;
    const postActions = [];

    postActions.push(this.templateRemove(editor, data, index));

    return html` <div
      class=${classMap({
        selective__droppable__target: true,
        selective__media_list__item: true,
        'selective__media_list__item--collapsed': true,
        'selective__media_list__item--no-drag': this.listField.length <= 1,
        selective__sortable: true,
      })}
      draggable=${canDrag && sortable.canDrag ? 'true' : 'false'}
      data-index=${index}
      @dragenter=${(evt: DragEvent) => {
        sortable.handleDragEnter(evt);
        droppable.handleDragEnter(evt);
      }}
      @dragleave=${(evt: DragEvent) => {
        sortable.handleDragLeave(evt);
        droppable.handleDragLeave(evt);
      }}
      @dragover=${(evt: DragEvent) => {
        sortable.handleDragOver(evt);
        droppable.handleDragOver(evt);
      }}
      @dragstart=${sortable.handleDragStart.bind(sortable)}
      @drop=${(evt: DragEvent) => {
        sortable.handleDrop(evt);
        droppable.handleDrop(evt);
      }}
      @focusin=${(evt: FocusEvent) => {
        sortable.handleFocusIn(evt);
        this.listField.render();
      }}
      @focusout=${(evt: FocusEvent) => {
        sortable.handleFocusOut(evt);
        this.listField.render();
      }}
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
    const canDrag = this.listField.length > 1;
    const sortable = this.listField.sortableUi;
    return html` <div
      class="selective__media_list__item selective__media_list__item--expanded selective__sortable"
      draggable=${canDrag && sortable.canDrag ? 'true' : 'false'}
      data-index=${index}
      @dragenter=${sortable.handleDragEnter.bind(sortable)}
      @dragleave=${sortable.handleDragLeave.bind(sortable)}
      @dragover=${sortable.handleDragOver.bind(sortable)}
      @dragstart=${sortable.handleDragStart.bind(sortable)}
      @drop=${sortable.handleDrop.bind(sortable)}
      @focusin=${(evt: FocusEvent) => {
        sortable.handleFocusIn(evt);
        this.listField.render();
      }}
      @focusout=${(evt: FocusEvent) => {
        sortable.handleFocusOut(evt);
        this.listField.render();
      }}
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
