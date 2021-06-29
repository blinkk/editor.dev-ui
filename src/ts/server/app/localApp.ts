import {EditorApp, EditorAppOptions} from './editorApp';
import {LiveEditorApiComponent, PingStatus} from '../../editor/api';
import {LocalServerApi, ServerApiComponent} from '../api';

import {GCSRemoteMedia} from '../../remoteMedia/GCSRemoteMedia';
import {RemoteMediaConstructor} from '../../remoteMedia';
import {rafTimeout} from '../../utility/rafTimeout';

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

    this._api = new LocalServerApi(this.options?.port || 9090);

    this._api.remoteMediaProviders.push(
      GCSRemoteMedia as unknown as RemoteMediaConstructor
    );

    return this._api;
  }

  async init() {
    // Test the local api to make sure that it is available before
    // we start rendering the editor. Otherwise show instructions for
    // starting the local server.
    const pingApi = async () => {
      try {
        const pingResponse = await (this.api as LocalServerApi).ping();

        if (pingResponse.status === PingStatus.Ok) {
          // Lazily creates the editor to render.
          this.editor.render();
        } else {
          console.error('Ping response not expected: ', pingResponse);
        }
      } catch (err) {
        console.error('Unable to ping the api.', err);
        rafTimeout(pingApi, 2500);
      }
    };

    try {
      await pingApi();
    } catch (err) {
      // Ignore error
    }
  }
}
