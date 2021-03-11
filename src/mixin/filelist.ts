import {Constructor} from '@blinkk/selective-edit/dist/src/mixins';

export interface FilelistUiComponent {
  handleClick(evt: Event): void;
}

export function FilelistMixin<TBase extends Constructor>(Base: TBase) {
  return class FilelistClass extends Base {
    _filelistUi?: FilelistUiComponent;

    get filelistUi(): FilelistUiComponent {
      if (!this._filelistUi) {
        this._filelistUi = new FilelistUi();
      }
      return this._filelistUi;
    }

    set filelistUi(value: FilelistUiComponent) {
      this._filelistUi = value;
    }
  };
}

export class FilelistUi implements FilelistUiComponent {
  handleClick(evt: Event): void {
    console.log('Click!', evt);
  }
}
