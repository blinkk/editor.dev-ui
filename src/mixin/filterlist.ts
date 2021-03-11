import {Constructor} from '@blinkk/selective-edit/dist/src/mixins';

export interface FilterlistUiComponent {
  handleClick(evt: Event): void;
}

export function FilterlistMixin<TBase extends Constructor>(Base: TBase) {
  return class FilterlistClass extends Base {
    _filterlistUi?: FilterlistUiComponent;

    get filterlistUi(): FilterlistUiComponent {
      if (!this._filterlistUi) {
        this._filterlistUi = new FilterlistUi();
      }
      return this._filterlistUi;
    }
  };
}

export class FilterlistUi implements FilterlistUiComponent {
  handleClick(evt: Event): void {
    console.log('Click!', evt);
  }
}
