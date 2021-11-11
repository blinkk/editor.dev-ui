import {
  DeepObject,
  FieldsComponent,
  GlobalConfig,
  SelectiveEditor,
  SortableFieldComponent,
  TemplateResult,
  Types,
  html,
} from '@blinkk/selective-edit';
import {
  ListField,
  ListFieldComponent,
  ListFieldConfig,
  ListFieldItem,
  ListItemComponent,
} from '@blinkk/selective-edit/dist/selective/field/list';
import {EVENT_UNLOCK} from '@blinkk/selective-edit/dist/selective/events';
import {HoverMenu} from '../ui/hoverMenu';
import cloneDeep from 'lodash.clonedeep';

export interface MenuListFieldComponent extends ListFieldComponent {
  /**
   * Event handler for duplicating a list item.
   *
   * @param evt Click event from delete action.
   * @param index Item index the menu is showing for.
   */
  handleDuplicateItem(evt: Event, index: number): void;
  /**
   * Event handler for inserting a list item.
   *
   * @param evt Click event from delete action.
   * @param index Item index the menu is showing for.
   * @param insertAbove Should the new item be inserted above the index.
   */
  handleInsertItem(evt: Event, index: number, insertAbove: boolean): void;
}

export class MenuListField extends ListField implements MenuListFieldComponent {
  constructor(
    types: Types,
    config: ListFieldConfig,
    globalConfig: GlobalConfig,
    fieldType = 'list'
  ) {
    super(types, config, globalConfig, fieldType);
    this.ListItemCls = MenuListFieldItem;
  }

  handleDuplicateItem(evt: Event, index: number) {
    // Prevent the delete from bubbling.
    evt.stopPropagation();

    const items = this.items || [];

    // Clone the fields from the item being duplicated to keep the values.
    const fields = cloneDeep(items[index].fields);
    const newItem = new this.ListItemCls(this, fields);

    // Duplicate the item with a deep copy to prevent shared values.
    items.splice(index, 0, newItem);

    // Lock the fields to prevent the values from being updated at the same
    // time as the original value.
    const downstreamItems = items.slice(index);
    for (const item of downstreamItems) {
      item.fields.lock();
    }
    this.lock();

    // Unlock fields after saving is complete to let the values be updated
    // when clean.
    // TODO: Automate this unlock without having to be done manually.
    document.addEventListener(
      EVENT_UNLOCK,
      () => {
        for (const item of downstreamItems) {
          item.fields.unlock();
        }
        this.unlock();
        this.render();
      },
      {once: true}
    );

    this.render();
  }

  handleInsertItem(evt: Event, index: number, insertAbove: boolean) {
    // Prevent the delete from bubbling.
    evt.stopPropagation();

    const items = this.items || [];
    const fieldConfigs = this.config.fields || [];
    const fields = this.createFields(fieldConfigs);
    const newItem = new this.ListItemCls(this, fields);

    items.splice(index + (insertAbove ? 0 : 1), 0, newItem);

    // Lock the fields to prevent the values from being updated at the same
    // time as the original value.
    const downstreamItems = items.slice(index);
    for (const item of downstreamItems) {
      item.fields.lock();
    }
    this.lock();

    // Unlock fields after saving is complete to let the values be updated
    // when clean.
    // TODO: Automate this unlock without having to be done manually.
    document.addEventListener(
      EVENT_UNLOCK,
      () => {
        for (const item of downstreamItems) {
          item.fields.unlock();
        }
        this.unlock();
        this.render();
      },
      {once: true}
    );

    this.render();
  }
}

export class MenuListFieldItem
  extends ListFieldItem
  implements ListItemComponent
{
  listField: MenuListFieldComponent & SortableFieldComponent;
  hoverMenu: HoverMenu;

  constructor(
    listField: ListFieldComponent & SortableFieldComponent,
    fields: FieldsComponent
  ) {
    super(listField, fields);
    this.listField = listField as MenuListFieldComponent &
      SortableFieldComponent;
    this.fields = fields;
    this.isExpanded = false;
    this.hoverMenu = new HoverMenu({
      classes: ['le__hover_menu--bottom-left'],
      items: [
        {
          label: 'Insert above',
          icon: 'add_circle',
          isDisabled: () => {
            return !this.listField.allowAdd;
          },
          onClick: (evt: Event) => {
            this.listField.handleInsertItem(
              evt,
              this.getIndexFromElement(evt.target as HTMLElement),
              true
            );
          },
        },
        {
          label: 'Insert below',
          icon: 'add_circle',
          isDisabled: () => {
            return !this.listField.allowAdd;
          },
          onClick: (evt: Event) => {
            this.listField.handleInsertItem(
              evt,
              this.getIndexFromElement(evt.target as HTMLElement),
              false
            );
          },
        },
        {
          label: 'Duplicate',
          icon: 'file_copy',
          isDisabled: () => {
            return !this.listField.allowAdd;
          },
          onClick: (evt: Event) => {
            this.listField.handleDuplicateItem(
              evt,
              this.getIndexFromElement(evt.target as HTMLElement)
            );
          },
        },
        {
          label: 'Delete',
          icon: 'remove_circle',
          isDisabled: () => {
            return !this.listField.allowRemove;
          },
          onClick: (evt: Event) => {
            this.listField.handleDeleteItem(
              evt,
              this.getIndexFromElement(evt.target as HTMLElement)
            );
          },
        },
      ],
    });
  }

  protected getIndexFromElement(target: HTMLElement): number {
    const listItem = target.closest('.selective__list__item') as HTMLElement;
    return parseInt(listItem.dataset.index || '');
  }

  templateRemove(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    editor: SelectiveEditor,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: DeepObject,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    index: number
  ): TemplateResult {
    return html`<div class="le__menu_list__container">
      <div
        class="selective__action selective__action--hover selective__tooltip--left"
        data-item-uid=${this.uid}
        @click=${() => {
          if (this.hoverMenu.isVisible) {
            this.hoverMenu.hide();
          } else {
            // Add the click listener only after the event has bubbled.
            // This prevents the same click that opened the menu from closing the menu.
            document.addEventListener('click', () => this.hoverMenu.show(), {
              once: true,
            });
          }
        }}
        aria-label="Options"
        data-tip="Options"
      >
        <i class="material-icons icon">more_horiz</i>
      </div>
      ${this.hoverMenu.template()}
    </div>`;
  }
}
