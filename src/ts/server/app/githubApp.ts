import {EditorApp, EditorAppOptions} from './editorApp';

import {GCSRemoteMedia} from '../../remoteMedia/GCSRemoteMedia';
import {GithubApi} from '../gh/githubApi';
import {LiveEditorApiComponent} from '../../editor/api';
import {RemoteMediaConstructor} from '../../remoteMedia';
import {ServerApiComponent} from '../api';
import {ServiceOnboarding} from './service';

export interface GithubEditorAppOptions extends EditorAppOptions {
  organization?: string;
  project?: string;
  branch?: string;
}

export class GithubEditorApp extends EditorApp {
  options?: GithubEditorAppOptions;
  protected _api: (LiveEditorApiComponent & ServerApiComponent) | null;

  constructor(container: HTMLElement, options?: GithubEditorAppOptions) {
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

    this._api = new GithubApi(
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

  async init() {
    // Stop the normal editor processing if the check auth fails.
    if (!this.api.checkAuth()) {
      console.error('Unable to verify authentication.');

      // The api should redirect, so just stop JS.
      return;
    }

    // Check for information missing details needed for the editor.
    if (
      !this.options?.organization ||
      !this.options?.project ||
      !this.options?.branch
    ) {
      const onboarding = new GithubOnboarding(
        this.container,
        this.api as GithubApi
      );
      onboarding.render();
    } else {
      this.editor.render();
    }
  }
}

class GithubOnboarding extends ServiceOnboarding {
  api: GithubApi;

  constructor(container: HTMLElement, api: GithubApi) {
    super(container, api);
    this.api = api;
  }
}
