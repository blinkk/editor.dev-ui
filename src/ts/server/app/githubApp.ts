import {EditorApp, EditorAppOptions} from './editorApp';
import {
  GitHubInstallationInfo,
  GitHubOrgInstallationInfo,
  LiveEditorApiComponent,
  WorkspaceData,
} from '../../editor/api';
import {TemplateResult, html, repeat} from '@blinkk/selective-edit';

import {GCSRemoteMedia} from '../../remoteMedia/GCSRemoteMedia';
import {GitHubApi} from '../gh/githubApi';
import {RemoteMediaConstructor} from '../../remoteMedia';
import {ServerApiComponent} from '../api';
import {ServiceOnboarding} from './service';
import {templateLoading} from '../../editor/template';

const APP_URL = 'https://github.com/apps/editor-dev';
const BASE_URL = '/gh/';

/**
 * Do not want to have normal link clicks redirect, but still want
 * links to be able to be opened in a new tab.
 */
const preventNormalLinks = (evt: KeyboardEvent) => {
  if (evt.ctrlKey || evt.shiftKey || evt.metaKey) {
    // Stop the upstream click handler from triggering.
    evt.stopPropagation();
    return;
  }
  evt.preventDefault();
};

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
