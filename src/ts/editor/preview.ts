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
export function interpolatePreviewBaseUrl(
  settings: EditorPreviewSettings,
  workspace: WorkspaceData,
  params?: Record<string, string>
) {
  params = params ?? {
    workspace: shortenWorkspaceName(workspace.name),
    workspaceFull: workspace.name,
  };
  return interpolate(params, settings.baseUrl);
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

  params.baseUrl = interpolatePreviewBaseUrl(settings, workspace, params);

  if (settings.configUrl) {
    return interpolate(params, settings.configUrl);
  }

  // Default to the `preview.json` file.
  return `${params.baseUrl}${
    params.baseUrl.endsWith('/') ? '' : '/'
  }preview.json`;
}
