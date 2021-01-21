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

export interface ProjectData {
  title: string;
}

export interface WorkspaceData {
  branch: RepoBranch;
  name: string;
}

export interface LiveEditorApiComponent {
  getProject(): Promise<ProjectData>;
  getWorkspace(): Promise<WorkspaceData>;
  getWorkspaces(): Promise<Array<WorkspaceData>>;
}
