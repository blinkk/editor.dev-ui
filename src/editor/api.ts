import {
  EditorNotification,
  NotificationLevel,
  announceNotification,
} from './parts/notifications';

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
   * Full branch name.
   */
  name: string;
  /**
   * Commit hash of the last commit.
   */
  commit: string;
  /**
   * Summary of the last commit.
   */
  commitSummary: string;
  /**
   * Author of the last commit.
   */
  author: RepoAuthor;
}

/**
 * Device information used for previews.
 */
export interface DeviceData {
  canRotate?: boolean;
  height?: number;
  label: string;
  width?: number;
}

/**
 * File information.
 */
export interface FileData {
  /**
   * Complete path for the file.
   */
  path: string;
}

/**
 * Overall project information.
 */
export interface ProjectData {
  /**
   * Project title
   */
  title: string;
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
 * Interface for the live editor api.
 *
 * **Note:** Caching needs to be done by the api. The editor does not cache
 * the responses and will call the api method whenever it needs the data.
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
  deleteFile(path: string): Promise<null>;

  /**
   * Retrieve the devices that used for previews.
   */
  getDevices(): Promise<Array<DeviceData>>;

  /**
   * Retrieve the files that can be edited in the editor.
   */
  getFiles(): Promise<Array<FileData>>;

  /**
   * Retrieve information about the project.
   */
  getProject(): Promise<ProjectData>;

  /**
   * Retrieve the users that have access to the editor.
   */
  getUsers(): Promise<Array<UserData>>;

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
}

/**
 * Catch and announce an api error.
 *
 * @param error Error from api.
 */
export function catchError(error: ApiError) {
  error.level = NotificationLevel.Error;
  announceNotification(error);
}
