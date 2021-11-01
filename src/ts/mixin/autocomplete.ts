import {Base, Constructor} from '@blinkk/selective-edit/dist/mixins';
import {ListenersMixin, ListenersMixinComponent} from './listeners';
import {
  SelectiveEditor,
  TemplateResult,
  UuidMixin,
  html,
  repeat,
} from '@blinkk/selective-edit';
import {EVENT_RENDER} from '../editor/events';

export interface AutoCompleteUiComponent {
  items?: Array<AutoCompleteUiItemComponent>;
  labels?: AutoCompleteUiLabels;
  filter(value: string): void;
  handleFocus(evt: Event): void;
  handleIconClick(evt: Event): void;
  handleInputKeyDown(evt: KeyboardEvent): void;
  handleInputKeyUp(evt: KeyboardEvent): void;
  /**
   * Function for determining if the 'empty' message should be
   * shown based on the value.
   *
   * For fields that allow additional characters (ex: query string on yaml)
   * or arbitrary values it should hide the empty message since it can be
   * a valid value even though there are no matches found in the items list.
   */
  shouldShowEmpty?: (value: string) => boolean;
  templateIcons(editor: SelectiveEditor): TemplateResult;
  templateList(editor: SelectiveEditor, value: string): TemplateResult;
}

export interface AutoCompleteUiItemComponent {
  /**
   * Determines if the value provided matches for filtering.
   *
   * If returns `true` the item will show in the filtered list.
   *
   * @param value Value being used for filtering.
   */
  matchesFilter(value: string): boolean;
  templateItem(
    editor: SelectiveEditor,
    index: number,
    isSelected: boolean,
    handleClick: (evt: Event) => void
  ): TemplateResult;
  value: string;
  label: string;
  uid: string;
}

export interface AutoCompleteUiLabels {
  resultsNone?: string;
  resultsSingle?: string;
  resultsMultiple?: string;
}

export function AutoCompleteMixin<TBase extends Constructor>(Base: TBase) {
  return class AutoCompleteClass extends Base {
    _autoCompleteUi?: AutoCompleteUiComponent & ListenersMixinComponent;

    get autoCompleteUi(): AutoCompleteUiComponent & ListenersMixinComponent {
      if (!this._autoCompleteUi) {
        this._autoCompleteUi = new AutoCompleteUi();
      }
      return this._autoCompleteUi;
    }
  };
}

export class AutoCompleteUi
  extends ListenersMixin(Base)
  implements AutoCompleteUiComponent
{
  container?: HTMLElement;
  currentFilter?: string;
  currentIndex?: number;
  filteredItems?: Array<AutoCompleteUiItemComponent>;
  private hasBoundDocument?: boolean;
  isVisible?: boolean;
  labels?: AutoCompleteUiLabels;
  shouldShowEmpty?: (value: string) => boolean;
  _items?: Array<AutoCompleteUiItemComponent>;

  filter(value: string) {
    this.currentFilter = value;
    this.filteredItems = this.items?.filter(item => item.matchesFilter(value));

    // If it is an exact match show all the items instead.
    if (
      this.filteredItems?.length === 1 &&
      value === this.filteredItems[0].value
    ) {
      this.filteredItems = this.items;
    }

    this.currentIndex = undefined;
  }

  handleFocus(evt: Event) {
    // Store the parent container of the input to detect when clicking
    // outside of the container to close the auto complete.
    // This means that the autocomplete UI should be a sibling of the
    // input field.
    this.container = (evt.target as HTMLInputElement)
      .parentElement as HTMLElement;

    // Bind once to the document click to detect when the focis is
    // lost from both the input and the autocomplete.
    if (!this.hasBoundDocument) {
      this.hasBoundDocument = true;
      document.addEventListener('click', (clickEvt: Event) => {
        if (!this.container || !this.isVisible) {
          return;
        }

        let target: HTMLElement | null = clickEvt.target as HTMLElement;
        while (target) {
          if (target === this.container) {
            return;
          }
          target = target.parentElement;
        }
        this.isVisible = false;
        this.render();
      });
    }

    // Filter using the current field value.
    this.filter((evt.target as HTMLInputElement).value || '');

    this.isVisible = true;
    this.render();
  }

  get items(): Array<AutoCompleteUiItemComponent> | undefined {
    return this._items;
  }

  set items(values: Array<AutoCompleteUiItemComponent> | undefined) {
    this._items = values;

    if (this.currentFilter) {
      this.filter(this.currentFilter);
    } else {
      this.filteredItems = [...(values || [])];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleIconClick(evt: Event) {
    this.isVisible = !this.isVisible;
    this.render();
  }

  handleInputKeyDown(evt: KeyboardEvent) {
    // Detect when tabbing away from the input to close the autocomplete.
    switch (evt.key) {
      case 'Tab':
        this.isVisible = false;
        this.render();
        break;
    }
  }

  handleInputKeyUp(evt: KeyboardEvent) {
    switch (evt.key) {
      case 'ArrowDown':
        this.isVisible = true;
        this.nextItem();
        this.scrollToItem();
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'Shift':
        return;
      case 'ArrowUp':
        this.isVisible = true;
        this.previousItem();
        this.scrollToItem();
        break;
      case 'Enter':
      case ' ':
        if (this.currentIndex !== undefined && this.filteredItems) {
          this.selectItem(this.filteredItems[this.currentIndex]);
          return;
        }
        break;
      case 'Escape':
        this.isVisible = false;
        break;
      default:
        this.isVisible = true;
        // Trigger the listener for a keyup event.
        // This allows the field to handle updating the filter list options.
        this.triggerListener('keyup', (evt.target as HTMLInputElement).value);
    }
    this.render();
  }

  nextItem() {
    // Check for empty items.
    if (!this.filteredItems?.length) {
      this.currentIndex = undefined;
      return;
    }

    // Loop the options.
    if (this.currentIndex === this.filteredItems.length - 1) {
      this.currentIndex = 0;
      return;
    }

    this.currentIndex =
      this.currentIndex !== undefined ? this.currentIndex + 1 : 0;
  }

  previousItem() {
    // Check for empty items.
    if (!this.filteredItems?.length) {
      this.currentIndex = undefined;
      return;
    }

    // Loop the options.
    if (this.currentIndex === 0) {
      this.currentIndex = this.filteredItems.length - 1;
      return;
    }

    this.currentIndex =
      this.currentIndex !== undefined
        ? this.currentIndex - 1
        : this.filteredItems.length - 1;
  }

  /**
   * Signal for the editor to re-render.
   */
  render() {
    document.dispatchEvent(new CustomEvent(EVENT_RENDER));
  }

  /**
   * Make sure that the current index item is visible in the list.
   * If it is not, scroll to the item.
   */
  scrollToItem() {
    if (!this.container) {
      return;
    }

    const listElement = this.container.querySelector(
      '.selective__autocomplete__list'
    ) as HTMLElement;
    if (!listElement) {
      console.error('Unable to find the autocomplete list.');
      return;
    }
    const itemElement = listElement?.querySelector(
      `[data-index="${this.currentIndex}"]`
    ) as HTMLElement;
    if (!itemElement) {
      console.error('Unable to find the autocomplete item.');
      return;
    }

    // Center scroll to the item.
    listElement.scrollTo({
      top:
        itemElement.offsetTop +
        itemElement.offsetHeight / 2 -
        listElement.offsetHeight / 2,
      left: 0,
      behavior: 'smooth',
    });
  }

  selectItem(item: AutoCompleteUiItemComponent) {
    this.triggerListener('select', item.value);
    this.filter(item.value);
    this.isVisible = false;
    this.render();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateIcons(editor: SelectiveEditor): TemplateResult {
    return html`<div class="selective__field__actions">
      <div
        class="selective__action selective__tooltip--left"
        @click=${this.handleIconClick.bind(this)}
        aria-label="Toggle list"
        data-tip="Toggle list"
      >
        <span class="material-icons">list_alt</span>
      </div>
    </div>`;
  }

  templateList(editor: SelectiveEditor, value: string): TemplateResult {
    if (!this.isVisible) {
      return html``;
    }

    // Certain fields allow values that are not in the list but do not need
    // to show the empty items status and should hide the entire list.
    if ((this.filteredItems || []).length === 0) {
      if (this.shouldShowEmpty && !this.shouldShowEmpty(value)) {
        return html``;
      }
    }

    return html`<div class="selective__autocomplete">
      <div class="selective__autocomplete__list" role="listbox">
        ${this.templateStatus(editor, this.filteredItems || [])}
        ${repeat(
          this.filteredItems || [],
          item => item.uid,
          (item, index) =>
            item.templateItem(
              editor,
              index,
              this.currentIndex === index,
              () => {
                this.selectItem(item);
              }
            )
        )}
      </div>
    </div>`;
  }

  templateStatus(
    editor: SelectiveEditor,
    items: Array<AutoCompleteUiItemComponent>
  ): TemplateResult {
    let statusString = this.labels?.resultsMultiple
      ? this.labels.resultsMultiple.replace(
          '${items.length}',
          `${items.length}`
        )
      : `${items.length} results available.`;
    if (items.length === 0) {
      statusString = this.labels?.resultsNone || 'No results available.';
    } else if (items.length === 1) {
      statusString = this.labels?.resultsSingle || '1 result available.';
    }

    return html`<div
      class="selective__autocomplete__list__status"
      aria-live="polite"
      role="status"
    >
      ${statusString}
    </div>`;
  }
}

export class AutoCompleteUIItem
  extends UuidMixin(Base)
  implements AutoCompleteUiItemComponent
{
  value: string;
  label: string;

  constructor(value: string, label: string) {
    super();
    this.value = value;
    this.label = label;
  }

  /**
   * Used for filtering down the items in the items list.
   *
   * Uses case-insensitive matching for the value in the label or value.
   *
   * @param value Value input in the field.
   * @returns True if the value matches the value in some way.
   */
  matchesFilter(value: string): boolean {
    value = value.toLowerCase();
    return (
      this.value.toLocaleLowerCase().includes(value) ||
      this.label.toLowerCase().includes(value)
    );
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
      ${this.label}
    </div>`;
  }
}
