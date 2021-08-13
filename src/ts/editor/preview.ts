import {EditorPreviewSettings, WorkspaceData} from './api';
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
