import {
  EditorNotification,
  NotificationLevel,
  announceNotification,
} from './parts/notifications';
import {FieldConfig} from '@blinkk/selective-edit';
import {IncludeExcludeFilterConfig} from '../utility/filter';
import bent from 'bent';
import {FeatureManagerSettings} from '../utility/featureManager';

/**
 * Interface for the live editor api.
 *
 * This defines how the editor works with the underlying data. The api
 * is responsible for all file or network operations needed to make the
 * editor function.
 */
export interface LiveEditorApiComponent {
  /**
   * Copy a file.
   *
   * @param path Full path for the original file.
   * @param path Full path for the new file.
   */
  copyFile(originalPath: string, path: string): Promise<FileData>;

  /**
   * Create a new file from scratch.
   *
   * @param path Full path for the new file.
   */
  createFile(path: string): Promise<FileData>;

  /**
   * Create a new workspace based off an existing workspace.
   *
   * @param base Workspace to base new workspace from.
   * @param workspace New workspace name.
   */
  createWorkspace(
    base: WorkspaceData,
    workspace: string
  ): Promise<WorkspaceData>;

  /**
   * Delete an existing file.
   *
   * @param path Full path for the file being deleted.
   */
  deleteFile(file: FileData): Promise<null>;

  /**
   * Retrieve the devices used for previews.
   */
  getDevices(): Promise<Array<DeviceData>>;

  /**
   * Retrieve the file information.
   *
   * This is a complete loading of the file information and
   * configuration for use in rendering the editor for the
   * file.
   */
  getFile(file: FileData): Promise<EditorFileData>;

  /**
   * Retrieve the files that can be edited in the editor.
   */
  getFiles(): Promise<Array<FileData>>;

  /**
   * Retrieve the url to preview the file.
   *
   * When retrieving a list of files it is often slow
   */
  getFileUrl(file: FileData): Promise<FileData>;

  /**
   * Retrieve information about the project.
   */
  getProject(): Promise<ProjectData>;

  /**
   * Retrieve information about the active workspace.
   */
  getWorkspace(): Promise<WorkspaceData>;

  /**
   * Retrieve information about available workspaces.
   */
  getWorkspaces(): Promise<Array<WorkspaceData>>;

  /**
   * Load the workspace.
   *
   * This may redirect to a different URL.
   * (ex: workspaces may be domain based.)
   */
  loadWorkspace(workspace: WorkspaceData): Promise<WorkspaceData>;

  /**
   * Start the publish process.
   *
   * Begins the publish process. Some publish processes may take time and cannot
   * be completed right away. This api begins the process of publishing and
   * gives a status response on the new publish.
   */
  publish(
    workspace: WorkspaceData,
    data?: Record<string, any>
  ): Promise<PublishResult>;

  /**
   * Save the updated file data.
   *
   * @param file File data to be saved.
   */
  saveFile(file: EditorFileData): Promise<EditorFileData>;

  /**
   * Upload a file.
   *
   * Uses a File object to provide a blob file that should be uploaded
   * or saved appropriately. Often for media like images or videos.
   */
  uploadFile(file: File, meta?: Record<string, any>): Promise<FileData>;
}

/**
 * Interface for the structure of the editor settings file.
 *
 * Settings in a project's `editor.yaml` should follow this interface.
 */
export interface EditorFileSettings {
  /**
   * Title of the site to display in the editor.
   */
  title?: string;
  /**
   * Devices to use in the editor preview.
   */
  devices?: Array<DeviceData>;
  /**
   * Editor experiment flags and settings.
   *
   * Used to control editor.dev experiments for the project.
   */
  experiments?: Record<string, boolean | FeatureManagerSettings>;
  /**
   * Editor feature flags and settings.
   *
   * Used to control editor.dev features for the project.
   */
  features?: Record<string, boolean | FeatureManagerSettings>;
  /**
   * Configuration for the site display in the editor.
   */
  site?: SiteData;
  /**
   * Users or groups approved access to the editor.
   */
  users?: Array<UserData>;
}

/**
 * Device information used for previews.
 */
export interface DeviceData {
  /**
   * Can the device preview be rotated?
   */
  canRotate?: boolean;
  /**
   * Height of the device view.
   */
  height?: number;
  /**
   * Label for the device.
   */
  label: string;
  /**
   * Width of the device view.
   */
  width: number;
}

/**
 * Full file information for rendering the file editor.
 */
export interface EditorFileData {
  /**
   * File contents.
   *
   * For example, the html in an html file, or the markdown body
   * in a markdown file.
   */
  content?: string;
  /**
   * File data.
   *
   * For example, the frontmatter for a markdown file or the contents
   * of a yaml file.
   */
  data?: any;
  /**
   * Raw file data.
   *
   * For example, the frontmatter for a markdown file or the contents
   * of a yaml file. This is the unprocessed data string that can be edited
   * in the 'Raw' content form.
   */
  dataRaw?: string;
  /**
   * Editor configuration for the file.
   */
  editor: EditorFileConfig;
  /**
   * File information.
   */
  file: FileData;
  /**
   * File repository history.
   */
  history?: Array<RepoCommit>;
  /**
   * URL for viewing the file in the preview iframe.
   *
   * If no url is provided the preview will be hidden.
   */
  url?: string;
  /**
   * URLs for viewing the file in different environments.
   */
  urls?: Array<UrlConfig>;
}

/**
 * File information.
 */
export interface FileData {
  /**
   * Complete path for the file.
   */
  path: string;
  /**
   * URL for serving the file.
   *
   * Used for showing previews of different files.
   * For example, image or video previews.
   *
   * For performance reasons, file data does not need to include url
   * information as it may require more time to properly retrieve the
   * url for a file which can slow down file list retrieval.
   *
   * `undefined` url is used to denote that the url was not retrieved.
   * `null` url is used to denote that there is no url for the file.
   *
   * The editor will attempt to use the `getFileUrl()` api method when
   * the url is `undefined` and the url is needed. If the value is `null`
   * the editor assumes that there is no url for the file and does not
   * make a request to the `getFileUrl()` method.
   */
  url?: string | null;
}

/**
 * Overall project information.
 */
export interface ProjectData {
  /**
   * Project title
   */
  title: string;
  /**
   * Editor experiment flags and settings.
   *
   * Experiments can be defined in the `editor.yaml` file for the project.
   * The API can override experiment flags if the API does not support
   * specific experiments of the editor.
   */
  experiments?: Record<string, boolean | FeatureManagerSettings>;
  /**
   * Editor feature flags and settings.
   *
   * Features can be defined in the `editor.yaml` file for the project.
   * The API can override feature flags if the API does not support
   * specific features of the editor.
   */
  features?: Record<string, boolean | FeatureManagerSettings>;
  /**
   * Publish configuration for the project.
   *
   * This controls if the UI allows for publishing and what information
   * to collect for providing to the `publish` method on the api.
   */
  publish?: ProjectPublishConfig;
  /**
   * Configuration for the site display.
   */
  site?: SiteData;
  /**
   * Users or groups approved access to the editor.
   */
  users?: Array<UserData>;
}

/**
 * Result from starting the publish process.
 */
export interface PublishResult {
  /**
   * Status of the publish process.
   */
  status: PublishStatus | string;
  /**
   * Updated workspace data.
   *
   * When a publish process is complete the workflow for the publish
   * process can either keep the same workspace open, or remove it.
   * In the case that the workspace is removed, the api can direct the
   * editor to load a different workspace instead.
   */
  workspace?: WorkspaceData;
}

/**
 * Site information.
 */
export interface SiteData {
  /**
   * Site files configuration.
   */
  files?: SiteFilesConfig;
}

/**
 * User information.
 */
export interface UserData {
  /**
   * Name of the user.
   */
  name: string;
  /**
   * Email representing the user.
   */
  email: string;
  /**
   * Is the user data a group?
   */
  isGroup?: boolean;
}

/**
 * Workspace information.
 */
export interface WorkspaceData {
  /**
   * Full branch information from the workspace.
   */
  branch: RepoBranch;
  /**
   * Short name for the workspace used in labels and lists.
   */
  name: string;
  /**
   * Workspace specific publishing configuration.
   */
  publish?: WorkspacePublishConfig;
}

/**
 * When there are errors with an api call the promise should
 * be rejected with an ApiError argument.
 *
 * ```typescript
 * createWorkspace(base: WorkspaceData, workspace: string): Promise<null> {
 *   return new Promise<null>((resolve, reject) => {
 *     // Successful api calls resolve() when done.
 *     // Failure should reject() the promise with an ApiError argument.
 *     reject({message: 'Houston we have a problem'} as ApiError);
 *   });
 * }
 * ```
 */
export interface ApiError extends EditorNotification {
  /**
   * Additional meta information that can be used for a full report
   * or debugging of the error.
   */
  details?: any;
}

/**
 * Catch and announce an api error.
 *
 * @param error Error from api.
 */
export function catchError(
  error: ApiError | bent.StatusError,
  callback?: (error: ApiError) => void
) {
  const handler = callback || announceNotification;

  // Check for bent status error for failed api call.
  if ((error as bent.StatusError).json) {
    (error as bent.StatusError).json().then(value => {
      const apiError = value as ApiError;
      apiError.level = NotificationLevel.Error;
      handler(apiError);
    });
    return;
  }

  error = error as ApiError;
  error.level = NotificationLevel.Error;
  handler(error);
}

/**
 * Auxillary interfaces used in the api data.
 */

/**
 * Configuration for rendering the file editor.
 */
export interface EditorFileConfig {
  /**
   * Field configurations for the editor.
   */
  fields: Array<FieldConfig>;
}

/**
 * Configuration for how publishing works in the editor UI.
 */
export interface ProjectPublishConfig {
  /**
   * Field information for collecting information for the publish process.
   *
   * If there are field configurations provided the UI will prompt the user
   * for the information and pass it on to the `publish` api call.
   */
  fields?: Array<FieldConfig>;
}

/**
 * Configuration for how site files are displayed.
 */
export interface SiteFilesConfig {
  /**
   * Filter settings for how the site files are filtered.
   *
   * By default the site files filters:
   *  - Only `.yaml`, `.md`, and `.html` files.
   *  - Ignores files and directories starting with `_` and `.`.
   */
  filter?: IncludeExcludeFilterConfig;
}

/**
 * Status for the publish process.
 */
export enum PublishStatus {
  /**
   * There are no publish processes allowed.
   *
   * Some workspaces may not allow for publishing.
   * For example the `main` branch has no where to be published.
   */
  NotAllowed = 'NOT_ALLOWED',
  /**
   * There are no active publish processes.
   */
  NotStarted = 'NOT_STARTED',
  /**
   * There are no changes to publish.
   *
   * For example, the main branch and the current branch are on the same
   * commit and there is nothing to publish.
   */
  NoChanges = 'NO_CHANGES',
  /**
   * There is an active publish in process.
   */
  Pending = 'PENDING',
  /**
   * The publish process has completed.
   */
  Complete = 'COMPLETE',
  /**
   * There was a problem during the publish process.
   */
  Failure = 'FAILURE',
}

/**
 * Repository author information.
 */
export interface RepoAuthor {
  /**
   * Name of the author.
   */
  name: string;
  /**
   * Email address of the author.
   */
  email: string;
}

/**
 * Repository branch information.
 */
export interface RepoBranch {
  /**
   * Commit most recent commit.
   */
  commit: RepoCommit;
  /**
   * Full branch name.
   */
  name: string;
}

/**
 * Repository commit information.
 */
export interface RepoCommit {
  /**
   * Author of the last commit.
   */
  author: RepoAuthor;
  /**
   * Commit hash of the last commit.
   */
  hash: string;
  /**
   * Full commit message.
   */
  message?: string;
  /**
   * Summary of the commit.
   */
  summary: string;
  /**
   * Timestamp of commit.
   *
   * Needs to be in a `Date.parse()` valid datetime format.
   * For example: ISO 8601.
   */
  timestamp: string;
}

/**
 * Configuration for url the file editor.
 */
export interface UrlConfig {
  /**
   * Label for the url.
   */
  label: string;
  /**
   * Access level for the url.
   */
  level: UrlLevel | string;
  /**
   * URL for viewing the file.
   */
  url: string;
}

/**
 * Editor url accessibility level for a resource.
 */
export enum UrlLevel {
  /**
   * Private url, should not be shared to others and not public.
   *
   * For example, the editor preview url. It should not be shared
   * widely due to the transitive nature of workspaces, but can
   * still be used to viewed when needed.
   */
  Private = 'private',
  /**
   * Protected url, a shared service that is used for sharing
   * but still restricted in how it is accessed.
   *
   * For example, a staging server to preview changes before
   * they are live.
   */
  Protected = 'protected',
  /**
   * Public url, a publicly accessbile way to access the resource.
   *
   * For example, the live version of the site that users normally
   * see.
   */
  Public = 'public',
  /**
   * Source url, a remotely hosted version of the resource.
   *
   * For example, a url that shows the resource in a repository
   * like github.
   */
  Source = 'source',
}

/**
 * Configuration for how publishing works with a workspace.
 */
export interface WorkspacePublishConfig {
  status: PublishStatus | string;
}
