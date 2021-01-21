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

export interface LiveEditorApiComponent {
  getFiles(): Promise<Array<FileData>>;
  getProject(): Promise<ProjectData>;
  getUsers(): Promise<Array<UserData>>;
  getWorkspace(): Promise<WorkspaceData>;
  getWorkspaces(): Promise<Array<WorkspaceData>>;
}
