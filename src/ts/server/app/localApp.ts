import {EditorApp, EditorAppOptions} from './editorApp';
import {LocalServerApi, ServerApiComponent} from '../api';

import {GCSRemoteMedia} from '../../remoteMedia/GCSRemoteMedia';
import {LiveEditorApiComponent} from '../../editor/api';
import {RemoteMediaConstructor} from '../../remoteMedia';

export interface LocalEditorAppOptions extends EditorAppOptions {
  port: number;
}

export class LocalEditorApp extends EditorApp {
  options?: LocalEditorAppOptions;
  protected _api: (LiveEditorApiComponent & ServerApiComponent) | null;

  constructor(container: HTMLElement, options?: LocalEditorAppOptions) {
    super(container, options);
    this.options = options;
    this._api = null;

    // Check the current path for what the initial file should be.
    const urlParts = window.location.pathname
      .split('/')
      .filter(value => value.length) // Do not need empty items.
      .slice(1); // Remove the 'local' portion of url.

    if (urlParts.length) {
      this.initialFile = `/${urlParts.join('/')}`;
    }
  }

  get api(): LiveEditorApiComponent & ServerApiComponent {
    if (this._api) {
      return this._api;
    }

    this._api = new LocalServerApi(this.options?.port);

    this._api.remoteMediaProviders.push(
      GCSRemoteMedia as unknown as RemoteMediaConstructor
    );

    return this._api;
  }
}
