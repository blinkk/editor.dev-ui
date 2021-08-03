import {EditorApp, EditorAppOptions} from './editorApp';

import {GCSRemoteMedia} from '../../remoteMedia/GCSRemoteMedia';
import {GitHubApi} from '../gh/githubApi';
import {LiveEditorApiComponent} from '../../editor/api';
import {RemoteMediaConstructor} from '../../remoteMedia';
import {ServerApiComponent} from '../api';

export interface GitHubEditorAppOptions extends EditorAppOptions {
  organization?: string;
  project?: string;
  branch?: string;
}

export class GitHubEditorApp extends EditorApp {
  options?: GitHubEditorAppOptions;
  protected _api: (LiveEditorApiComponent & ServerApiComponent) | null;

  constructor(container: HTMLElement, options?: GitHubEditorAppOptions) {
    super(container, options);
    this.options = options || {};
    this._api = null;

    // Determine which pieces of information we know from the URL.
    const urlParts = window.location.pathname
      .split('/')
      .filter(value => value.length) // Do not need empty items.
      .slice(1); // Remove the service portion of url.

    if (urlParts.length >= 1) {
      this.options.organization = urlParts[0];
    }
    if (urlParts.length >= 2) {
      this.options.project = urlParts[1];
    }
    if (urlParts.length >= 3) {
      this.options.branch = urlParts[2];
    }
    if (urlParts.length >= 4) {
      this.initialFile = `/${urlParts.slice(3).join('/')}`;
    }
  }

  get api(): LiveEditorApiComponent & ServerApiComponent {
    if (this._api) {
      return this._api;
    }

    this._api = new GitHubApi(
      'gh',
      this.options?.organization,
      this.options?.project,
      this.options?.branch,
      this.isUnstable,
      this.isDev
    );

    this._api.remoteMediaProviders.push(
      GCSRemoteMedia as unknown as RemoteMediaConstructor
    );

    return this._api;
  }
}
