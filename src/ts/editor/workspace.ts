import {EditorPreviewSettings, WorkspaceData} from './api';
import {interpolate} from '../utility/stringLiteral';

export const SPECIAL_BRANCHES = ['main', 'master', 'staging'];

/**
 * The branch names in the editor are either specific reserved branche names
 * or should be prefixed by `workspace/`.
 *
 * @param branch Short branch name from url.
 */
export function expandWorkspaceBranch(branch: string): string {
  // Special branches are considered workspace branches.
  if (SPECIAL_BRANCHES.includes(branch)) {
    return branch;
  }
  return `workspace/${branch}`;
}

/**
 * Determines which branches should be shown in the editor.
 *
 * @param branch Full branch reference
 * @returns If the branch should be shown in the editor as a workspace.
 */
export function isWorkspaceBranch(branch: string): boolean {
  // Special branches are considered workspace branches.
  if (SPECIAL_BRANCHES.includes(branch)) {
    return true;
  }
  return branch.startsWith('workspace/');
}

/**
 * Shortens down the full branch name to make it more readable.
 *
 * @param branch full branch name
 * @returns shortened version of the branch name
 */
export function shortenWorkspaceName(branch: string) {
  return branch.replace(/^workspace\//, '');
}

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
