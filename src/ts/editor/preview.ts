import {EditorPreviewSettings, WorkspaceData} from './api';

import {Base} from '@blinkk/selective-edit/dist/mixins';
import {ListenersMixin} from '../mixin/listeners';
import {interpolate} from '../utility/stringLiteral';
import {shortenWorkspaceName} from './workspace';

/**
 * Uses string literals to convert a preview server url into a full url.
 *
 * @param settings Editor preview settings.
 * @param workspace Workspace to generate the url for.
 * @returns Interpolated url for the base preview server.
 */
export function interpolatePreviewUrl(
  settings: EditorPreviewSettings,
  workspace: WorkspaceData,
  params?: Record<string, string>,
  path = '/'
) {
  params = params ?? {
    workspace: shortenWorkspaceName(workspace.name),
    workspaceFull: workspace.name,
  };
  const baseUrl = interpolate(params, settings.baseUrl);
  path = path.replace(/^\/*/, '');
  return `${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}${path}`;
}

/**
 * Uses string literals to convert a preview server url into a full url.
 *
 * Specific to for loading the settings config file.
 *
 * @param settings Editor preview settings.
 * @param workspace Workspace to generate the url for.
 * @returns Interpolated url for the base preview server.
 */
export function interpolatePreviewConfigUrl(
  settings: EditorPreviewSettings,
  workspace: WorkspaceData
) {
  const params = {
    workspace: shortenWorkspaceName(workspace.name),
    workspaceFull: workspace.name,
    baseUrl: '',
  };

  params.baseUrl = interpolatePreviewUrl(settings, workspace, params);
  params.baseUrl = `${params.baseUrl}${
    params.baseUrl.endsWith('/') ? '' : '/'
  }`;

  if (settings.configUrl) {
    let configUrl = settings.configUrl;
    // If the config URL is a absolute path, prepend with base url.
    if (configUrl.startsWith('/')) {
      configUrl = `${params.baseUrl}${configUrl.slice(1)}`;
    }
    return interpolate(params, configUrl);
  }

  // Default to the `preview.json` file.
  return `${params.baseUrl}preview.json`;
}

export interface PreviewEvent {
  event: string;
  details?: any;
}

export interface PreviewConnectEvent extends PreviewEvent {
  event: 'connect';
}

export type PreviewCommunication = PreviewConnectEvent | PreviewEvent;

/**
 * Enable communication between the preview iframe and the editor.
 */
export class PreviewCommunicator extends ListenersMixin(Base) {
  iframe?: HTMLIFrameElement;
  queue: PreviewCommunication[] = [];

  constructor() {
    super();

    window.addEventListener('message', event => {
      if (!event.data.event) {
        return;
      }

      // Check for a connect event, link the iframe to the communicator.
      if (event.data.event === 'connect') {
        const iframe = document.querySelector(
          '.le__part__preview__frame iframe'
        );
        if (iframe) {
          this.connect(iframe as HTMLIFrameElement);
        }
      }

      this.triggerListener(event.data.event, event.data.details || {});
    });
  }

  connect(iframe: HTMLIFrameElement) {
    this.iframe = iframe;

    // Send connect message back to iframe as a confirmation.
    this.send({event: 'connect'});

    // Send queued events.
    for (const event of this.queue) {
      this.send(event);
    }
    this.queue = [];
  }

  send(event: PreviewCommunication) {
    if (!this.iframe) {
      this.queue.push(event);
      return;
    }

    // Currently ignores when no iframe. Change to queue messages?
    this.iframe?.contentWindow?.postMessage(event, '*');
  }
}
