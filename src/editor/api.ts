export interface RepoAuthor {
  name: string;
  email: string;
}

export interface RepoBranch {
  name: string;
  commit: string;
  commitSummary: string;
  author: RepoAuthor;
}

export interface FileData {
  path: string;
  shortcutPath?: string;
}

export interface ProjectData {
  title: string;
}

export interface UserData {
  name: string;
  email: string;
  isGroup?: boolean;
}

export interface WorkspaceData {
  branch: RepoBranch;
  name: string;
}

/**
 * Where there are errors with an api call the promise should
 * be rejected with an ApiError argument.
 *
 * ```typescript
 * createWorkspace(base: WorkspaceData, workspace: string): Promise<null> {
 *   return new Promise<null>((resolve, reject) => {
 *     // Create the workspace, calling resolve() when done.
 *     // Failure should reject the promise with an ApiError argument.
 *     reject({message: 'Houston we have a problem'});
 *   });
 * }
 * ```
 */
export interface ApiError {
  message: string;
  description?: string;
  meta?: any;
}

export interface LiveEditorApiComponent {
  /**
   * Create a new workspace based off an existing workspace.
   *
   * @param base Workspace to base new workspace from.
   * @param workspace New workspace name.
   */
  createWorkspace(base: WorkspaceData, workspace: string): Promise<null>;

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
}
