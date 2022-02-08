import {
  EditorNotification,
  NotificationLevel,
  announceNotification,
} from './ui/parts/notifications';
import {FeatureManagerSettings} from '../utility/featureManager';
import {FieldConfig} from '@blinkk/selective-edit';
import {IncludeExcludeFilterConfig} from '../utility/filter';
import {LiveEditorLabels} from './template';
import bent from 'bent';

/**
 * Interface for the live editor api.
 *
 * This defines how the editor works with the underlying data. The api
 * is responsible for all file or network operations needed to make the
 * editor function.
 */
export interface LiveEditorApiComponent {
  /**
   * Verify that the authentication for services that require auth.
   *
   * @returns True if the authentication is complete.
   */
  checkAuth(): boolean;

  /**
   * Verify that the basic information is available for the editor.
   *
   * If information needed to start editing files are missing the
   * onboarding UI will be shown.
   *
   * @returns Onboarding status to determine if the app needs to
   * onboard users to prompt for more information.
   */
  checkOnboarding(): Promise<OnboardingInfo>;

  /**
   * Clean any current authentication and log out the user of any
   * accounts.
   */
  clearAuth(): Promise<void>;

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
  deleteFile(file: FileData): Promise<EmptyData>;

  /**
   * Retrieve information about the account requirements for the
   * project.
   */
  getAuthentication(): Promise<AuthenticationData>;

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
   * When retrieving a list of files it is often slow to
   * retrieve the serving url for all the files. If the
   * preview url is missing, the API will be called to
   * the serving url on a per file basis.
   */
  getFileUrl(file: FileData): Promise<FileData>;

  /**
   * Retrieve configuration for the preview server.
   */
  getPreviewConfig(
    settings: EditorPreviewSettings,
    workspace: WorkspaceData
  ): Promise<PreviewSettings>;

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
   * Project type specific apis.
   */
  projectTypes: ApiProjectTypes;

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
   * @param isRawEdit Is the edit to the raw file data?
   */
  saveFile(file: EditorFileData, isRawEdit: boolean): Promise<EditorFileData>;

  /**
   * Update onboarding information when it is changed in the UI.
   *
   * If information needed to start editing files are missing the
   * onboarding UI will be shown. After updating the API decides
   * if the onboarding is complete.
   *
   * @returns Onboarding status to determine if the app needs to
   * onboard users to prompt for more information.
   */
  updateOnboarding(info: OnboardingInfo): Promise<OnboardingInfo>;

  /**
   * Upload a file.
   *
   * Uses a File object to provide a blob file that should be uploaded
   * or saved appropriately. Often for media like images or videos.
   */
  uploadFile(file: File, options?: MediaOptions): Promise<MediaFileData>;
}

/**
 * Information about the account requirements.
 */
export interface AuthenticationData {
  /**
   * Are there accounts in use?
   */
  usesAccounts: boolean;
}

export interface ApiProjectTypes {
  amagaki: AmagakiProjectTypeApi;
  grow: GrowProjectTypeApi;
}

export interface AmagakiProjectTypeApi {
  /**
   * Retrieve the partials for the project for the partials field.
   */
  getPartials(): Promise<Record<string, PartialData>>;
}

export interface GrowProjectTypeApi {
  /**
   * Retrieve the partials for the project for the partials field.
   */
  getPartials(): Promise<Record<string, PartialData>>;

  /**
   * Retrieve the available strings used in the `!g.string` yaml constructor.
   *
   * Returns a mapping of strings podpath to the contents of the strings file.
   *
   * ```json
   * {
   *   "/content/strings/example.yaml": {
   *     "foo": "bar"
   *   }
   * }
   * ```
   */
  getStrings(): Promise<Record<string, any>>;
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
   * Media configuration for the project.
   *
   * This controls options around how the media is handled in the project.
   * Including custom providers for media upload.
   */
  media?: ProjectMediaConfig;
  /**
   * Settings for previewing the files.
   */
  preview?: EditorPreviewSettings;
  /**
   * Configuration for the site display in the editor.
   */
  site?: SiteData;
  /**
   * Users or groups approved access to the editor.
   */
  users?: Array<UserData>;
  /**
   * Settings for customizing the editor UI.
   */
  ui?: EditorUiSettings;
}

export interface EditorPreviewSettings {
  /**
   * Base url for the preview iframe to use.
   *
   * All preview urls will use the base url for things like the preview
   * iframe, non-remote media urls, etc.
   */
  baseUrl: string;
  /**
   * Url for preview server configuration for the site.
   *
   * If no route url is provided the editor will use the `baseUrl` and
   * search for `${baseUrl}/preview.json`.
   *
   * Example `preview.json` format (Uses PreviewFileSettings interface):
   *
   * ```json
   * {
   *   "routes": {
   *     "/content/pages/index.yaml": {
   *       "en": {
   *         "path": "/",
   *         "title": "Coolest site evar!",
   *       }
   *     }
   *   }
   * }
   * ```
   */
  configUrl?: string;
}

export interface EditorUiSettings {
  /**
   * Labels for customizing the editor UI.
   */
  labels?: LiveEditorLabels;
}

/**
 * Interface for the structure of the preview server config.
 *
 * The editor reads the preview server's configuration to determine
 * how to preview content.
 *
 * The url of the preview server configuration is defined in the
 * `EditorFileSettings`.
 */
export interface PreviewSettings {
  /**
   * Default locale used by the preview server.
   */
  defaultLocale: string;
  /**
   * Route information for the preview server
   */
  routes: PreviewRoutesData;
}

/**
 * Interface for the structure of the preview routes file.
 *
 * The editor reads the preview server's routes file to determine
 * how to serve a file's preview.
 */
export interface PreviewRoutesData {
  /**
   * Mapping of path string to the localized or meta data for
   * the path contents.
   */
  [path: string]: PreviewRoutesLocaleData | PreviewRoutesMetaData;
}

/**
 * Interface for the preview server's route localized data.
 *
 * File contents
 */
export interface PreviewRoutesLocaleData {
  /**
   * Mapping of a locale to the meta data about the path contents.
   */
  [locale: string]: PreviewRoutesMetaData;
}

/**
 * Interface for the preview server's route meta data.
 *
 * Every file in the routes provides information for the editor to use
 * in previewing a servable path.
 */
export interface PreviewRoutesMetaData {
  /**
   * Title for the route resource.
   *
   * For example, the title of a page if the path is a document.
   */
  title?: string;
  /**
   * Serving path for the servable file.
   *
   * Should be a relative path from the preview server's `baseUrl` defined
   * in the `editor.yaml` (ex: `/images/something.png`)
   * or a fully qualified url for serving the file (ex: `https://...`).
   */
  path: string;
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
   * Is the device the default for the device view?
   */
  isDefault?: boolean;
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
   *
   * If not provided the editor will attempt to guess the fields to use.
   */
  editor?: EditorFileConfig;
  /**
   * File information.
   */
  file: FileData;
  /**
   * File repository history.
   */
  history?: Array<RepoCommit>;
  /**
   * Sha of the file being edited.
   *
   * Used by the api to verify that there are no new changes to the file
   * since the edit started to avoid overwriting external changes.
   */
  sha?: string;
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
 * Empty response from the api.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmptyData {}

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

export interface PartialData {
  /**
   * Partial identifier.
   *
   * This is the same value used in the partial definition of partials
   * in content files.
   */
  partial: string;
  /**
   * Configuration for how the editor should present the partial in the
   * editor.
   */
  editor?: PartialEditorConfig;
}

/**
 * Configuration for rendering the file editor.
 */
export interface PartialEditorConfig {
  /**
   * Partial label.
   */
  label?: string;
  /**
   * Partial description.
   */
  description?: string;
  /**
   * Field configurations for the editor.
   */
  fields: Array<FieldConfig>;
  /**
   * Is the partial hidden?
   *
   * Partials can opt to not show the partial in the listing of partials.
   * This is helpful for partials that are part of the design such as
   * header and footer partials.
   */
  isHidden?: boolean;
  /**
   * Preview field key.
   *
   * When showing a preview of the partial, use this field key to determine
   * the value to show for the preview.
   */
  previewField?: string;
  /**
   * Preview field keys.
   *
   * When showing a preview of the partial, use these field keys to determine
   * the value to show for the preview.
   */
  previewFields?: Array<string>;
  /**
   * When displaying lists of paritals the priority will affect the
   * sort order of the partials.
   *
   * Default priority is 1000
   */
  priority?: number;
}

/**
 * Overall project information.
 */
export interface ProjectData {
  /**
   * Url for an avatar to use when showing a project.
   */
  avatarUrl?: string;
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
   * The editor will use important links for the project in the UI.
   */
  links?: ProjectLinksData;
  /**
   * Media configuration for the project.
   *
   * This controls options around how the media is handled in the project.
   */
  media?: ProjectMediaConfig;
  /**
   * Publish configuration for the project.
   *
   * This controls if the UI allows for publishing and what information
   * to collect for providing to the `publish` method on the api.
   */
  publish?: ProjectPublishConfig;
  /**
   * Settings for previewing the project files.
   */
  preview?: EditorPreviewSettings;
  /**
   * Configuration for the site display.
   */
  site?: SiteData;
  /**
   * Information about the source of the project.
   *
   * This information provides information for the editor on where the
   * project data is coming from (ex: local project or a service).
   */
  source?: SourceData;
  /**
   * Project type for the editor to use.
   */
  type?: ProjectTypes | string;
  /**
   * Settings for customizing the editor UI.
   */
  ui?: EditorUiSettings;
  /**
   * Users or groups approved access to the editor.
   */
  users?: Array<UserData>;
}

/**
 * Links for the project that can be used in the UI to direct the user.
 */
export interface ProjectLinksData {
  /**
   * The UI can display a breadcrumb style heirarchy links for the project.
   * This allows for easier navigation between projects on a given service.
   */
  breadcrumbs?: Array<LinkData>;
}

/**
 * Information about a specific link.
 */
export interface LinkData {
  /**
   * Label for how the link is displayed.
   */
  label?: string;
  /**
   * URL for the link.
   */
  url: string;
}

/**
 * Result from pinging the api.
 */
export interface PingResult {
  /**
   * Status of the api.
   */
  status: PingStatus | string;
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
  /**
   * URLs for viewing the publish state.
   */
  urls?: Array<UrlConfig>;
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
 * Information on the source of the project data.
 */
export interface SourceData {
  /**
   * Source identifier.
   */
  source: ProjectSource | string;
  /**
   * Label shown to the user for identifying the source.
   */
  label: string;
  /**
   * Identifier for the project.
   *
   * For example, in a github project this would be the
   * '<organization>/<project>' (ex: blinkk/amagaki-starter)
   */
  identifier: string;
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
  /**
   * Code for what error is being returned.
   */
  errorCode?: ApiErrorCode | string;
}

export enum ApiErrorCode {
  FileNotFound = 'FileNotFound',
  WorkspaceNotFound = 'WorkspaceNotFound',
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
 * Configuration for how media works in the editor UI.
 */
export interface ProjectMediaConfig {
  /**
   * Remote configuration for uploading media to a remote provider.
   *
   * This is used for things such as uploading to a CDN or
   * optimization service.
   */
  remote?: RemoteMediaOptions;
  /**
   * Local media configuration for uploading media using the
   * connector api.
   */
  options?: MediaOptions;
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
 * Remote media providers supported in the editor.
 */
export enum RemoteMediaProviders {
  GCS = 'GCS',
}

/**
 * Project types supported in the editor.
 */
export enum ProjectTypes {
  Amagaki = 'Amagaki',
  Grow = 'Grow',
}

/**
 * Status for the api ping.
 */
export enum PingStatus {
  /**
   * Api is available.
   */
  Ok = 'Ok',
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
  NotAllowed = 'NotAllowed',
  /**
   * There are no active publish processes.
   */
  NotStarted = 'NotStarted',
  /**
   * There are no changes to publish.
   *
   * For example, the main branch and the current branch are on the same
   * commit and there is nothing to publish.
   */
  NoChanges = 'NoChanges',
  /**
   * There is an active publish in process.
   */
  Pending = 'Pending',
  /**
   * The publish process has completed.
   */
  Complete = 'Complete',
  /**
   * There was a problem during the publish process.
   */
  Failure = 'Failure',
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
  /**
   * Url for viewing the branch in an external system.
   */
  url?: string;
}

/**
 * Repository commit information.
 */
export interface RepoCommit {
  /**
   * Author of the last commit.
   */
  author?: RepoAuthor;
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
  summary?: string;
  /**
   * Timestamp of commit.
   *
   * Needs to be in a `Date.parse()` valid datetime format.
   * For example: ISO 8601.
   */
  timestamp?: string;
  /**
   * Url to view the commit externally.
   */
  url?: string;
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
   * URL for viewing.
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
  Private = 'Private',
  /**
   * Protected url, a shared service that is used for sharing
   * but still restricted in how it is accessed.
   *
   * For example, a staging server to preview changes before
   * they are live.
   */
  Protected = 'Protected',
  /**
   * Public url, a publicly accessbile way to access the resource.
   *
   * For example, the live version of the site that users normally
   * see.
   */
  Public = 'Public',
  /**
   * Source url, a remotely hosted version of the resource.
   *
   * For example, a url that shows the resource in a repository
   * like github.
   */
  Source = 'Source',
}

/**
 * Configuration for how publishing works with a workspace.
 */
export interface WorkspacePublishConfig {
  /**
   * Current status of the workspace publishing.
   */
  status: PublishStatus | string;
  /**
   * URLs for viewing the publish state.
   */
  urls?: Array<UrlConfig>;
}

/**
 * Onboarding
 */

/**
 * Status of the onboarding for the app.
 *
 * Determines if the user is missing information needed
 * to start editing files and denotes which onboarding process
 * to use.
 */
export interface OnboardingInfo {
  /**
   * Is the api missing information or has all information needed?
   */
  status: OnboardingStatus;
  /**
   * The onboarding flow to use if missing information.
   */
  flow?: OnboardingFlow;
  /**
   * Data needed for onboarding flow.
   *
   * The UI uses this data to know which pieces of information
   * the onboarding flow needs to prompt the user for.
   */
  data?: OnboardingData;
}

/**
 * Onboarding status.
 */
export enum OnboardingStatus {
  Valid = 'Valid',
  Missing = 'Missing',
}

/**
 * Available onboarding flows.
 */
export enum OnboardingFlow {
  Local = 'Local',
  GitHub = 'GitHub',
}

export type OnboardingData = OnboardingDataGitHub | OnboardingDataLocal;

/**
 * Onboarding data for the github service.
 */
export interface OnboardingDataGitHub {
  organization?: string;
  project?: string;
  branch?: string;
}

/**
 * Onboarding data for the local projects.
 */
export interface OnboardingDataLocal {
  port?: number;
}

/**
 * Media interfaces.
 */

/**
 * Metadata from a remote provider media upload.
 */
export interface MediaFileMetaInfo {
  height?: number;
  mimeType?: string;
  width?: number;
}

/**
 * File data specific to media files.
 */
export interface MediaFileData extends FileData {
  meta?: MediaFileMetaInfo;
}

/**
 * Configuration for remote media providers.
 *
 * Used by the file upload to support different services to upload the
 * media to be processed/stored.
 */
export interface MediaOptions {
  /**
   * Identifier for the provider that will be handling the upload
   * request.
   */
  provider?: RemoteMediaProviders | string;
  /**
   * Set if it is set as the default used for all media uploads.
   *
   * Local media upload is the default upload unless otherwise designated.
   */
  isDefault?: boolean;
}

/**
 * Configuration for the Google remote media provider.
 *
 * Currently works with the backend from https://github.com/grow/grow-ext-google-cloud-images
 */
export interface GoogleMediaOptions extends MediaOptions {
  /**
   * Url for the endpoint to handle the file upload.
   */
  url: string;
  /**
   * Bucket name to upload the media file to.
   */
  bucket?: string;
}

/**
 * Supported options for remote media provider options.
 */
export type RemoteMediaOptions = GoogleMediaOptions;

/**
 * GitHub service installations information.
 */
export interface GitHubInstallationInfo {
  avatarUrl?: string;
  id: number;
  org: string;
  url: string;
}

/**
 * GitHub service organization installation information.
 */
export interface GitHubOrgInstallationInfo {
  avatarUrl?: string;
  description: string;
  org: string;
  repo: string;
  updatedAt?: string;
  url: string;
}

/**
 * GitHub service branch information.
 */
export interface GitHubBranchInfo {
  branch: string;
  repo: string;
  org: string;
}

export enum ProjectSource {
  Example = 'Example',
  Local = 'Local',
  GitHub = 'GitHub',
}
