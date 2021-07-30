import {DataStorage} from '../utility/dataStorage';
import {ProjectSource} from './api';

const STORAGE_RECENT_PROJECTS = 'live.history.recent.projects';
const STORAGE_RECENT_PROJECT_PREFIX = 'live.history.';

export interface EditorHistoryConfig {
  storage: DataStorage;
}

export interface ProjectHistoryConfig {
  id: string;
  storage: DataStorage;
}

/**
 * Track historical events in the editor.
 *
 * Uses a project identifier to store the history in the storage.
 *
 * Example identifiers: `local`, `gh/blinkk/project`.
 *
 * Usage:
 *
 * ```
 * const editorHistory = new EditorHistory({
 *   storage: storage,
 * });
 * const projectHistory = editorHistory.getProject('local');
 * projectHistory.recentWorkspaces;
 * ```
 *
 * The history is also used to store history of the general access
 * of projects.
 *
 * ```
 * const recentProjects = editorHistory.recentProjects;
 * ```
 */
export class EditorHistory {
  config: EditorHistoryConfig;

  constructor(config: EditorHistoryConfig) {
    this.config = config;
  }

  /**
   * Adds a project data to the history of recent projects.
   *
   * @param project Project information to add to the history.
   * @returns Updated recent project history.
   */
  addRecentProject(project: RecentProjectData): Array<RecentProjectData> {
    const updatedRecentProjects = updateRecentProjects(
      this.recentProjects,
      project
    );
    this.config.storage.setItemArray(
      STORAGE_RECENT_PROJECTS,
      updatedRecentProjects
    );
    return updatedRecentProjects;
  }

  /**
   * Retrieve the project specific history data.
   */
  getProject(projectId: string): ProjectHistory {
    return new ProjectHistory({
      id: projectId,
      storage: this.config.storage,
    });
  }

  /**
   * Retrieve the recent projects.
   */
  get recentProjects(): Array<RecentProjectData> {
    return this.config.storage.getItemArray(STORAGE_RECENT_PROJECTS);
  }
}

export class ProjectHistory {
  config: ProjectHistoryConfig;
  data: ProjectHistoryData;

  constructor(config: ProjectHistoryConfig) {
    this.config = config;

    this.data = this.config.storage.getItemRecord(
      `${STORAGE_RECENT_PROJECT_PREFIX}${this.config.id}`
    );
  }

  /**
   * Adds file data to the history of the project.
   *
   * @param workspace Workspace name the file belongs to.
   * @param file File information to add to the history.
   * @returns Updated recent file history.
   */
  addRecentFile(
    workspace: string,
    file: RecentFileData
  ): Array<RecentFileData> {
    this.data.recentFiles = this.data.recentFiles ?? {};
    this.data.recentFiles[workspace] = this.data.recentFiles[workspace] ?? [];
    this.data.recentFiles[workspace] = updateRecentFiles(
      this.data.recentFiles[workspace],
      file
    );
    this.save();
    return this.data.recentFiles[workspace];
  }

  /**
   * Adds workspace to the history of the project.
   *
   * @param workspace Workspace information to add to the history.
   * @returns Updated recent file history.
   */
  addRecentWorkspace(
    workspace: RecentWorkspaceData
  ): Array<RecentWorkspaceData> {
    this.data.recentWorkspaces = this.data.recentWorkspaces ?? [];
    this.data.recentWorkspaces = updateRecentWorkspaces(
      this.data.recentWorkspaces,
      workspace
    );
    this.save();
    return this.data.recentWorkspaces;
  }

  getRecentFiles(workspace: string): Array<RecentFileData> {
    this.data.recentFiles = this.data.recentFiles ?? {};
    this.data.recentFiles[workspace] = this.data.recentFiles[workspace] ?? [];
    return this.data.recentFiles[workspace];
  }

  getRecentWorkspaces(): Array<RecentWorkspaceData> {
    this.data.recentWorkspaces = this.data.recentWorkspaces ?? [];
    return this.data.recentWorkspaces;
  }

  save() {
    this.config.storage.setItemRecord(
      `${STORAGE_RECENT_PROJECT_PREFIX}${this.config.id}`,
      this.data
    );
  }
}

export interface ProjectHistoryData {
  recentFiles?: Record<string, Array<RecentFileData>>;
  recentWorkspaces?: Array<RecentWorkspaceData>;
}

export interface RecentProjectData {
  /**
   * Project identifier.
   *
   * ex: `local`, `blinkk/project`
   */
  identifier: string;
  /**
   * Source of the project.
   */
  source?: ProjectSource | string;
  /**
   * Label for displaying the project to the user.
   */
  label: string;
  /**
   * Avatar url for the project.
   */
  avatarUrl?: string;
  /**
   * Timestamp of last date visited
   */
  lastVisited: string;
}

export interface RecentFileData {
  /**
   * Path for the file.
   */
  path: string;
  /**
   * Timestamp of last date visited
   */
  lastVisited: string;
}

export interface RecentWorkspaceData {
  /**
   * Name of the workspace.
   */
  name: string;
  /**
   * Timestamp of last date visited
   */
  lastVisited: string;
}

function updateRecentFiles(
  list: Array<RecentFileData>,
  value: RecentFileData,
  maxCount = 10
): Array<RecentFileData> {
  let index: undefined | number = undefined;

  // Search for matching item in the list.
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item.path === value.path) {
      index = i;
      break;
    }
  }

  return updateRecentList(list, value, index, maxCount);
}

function updateRecentProjects(
  list: Array<RecentProjectData>,
  value: RecentProjectData,
  maxCount = 10
): Array<RecentProjectData> {
  let index: undefined | number = undefined;

  // Search for matching item in the list.
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item.source === value.source && item.identifier === value.identifier) {
      index = i;
      break;
    }
  }

  return updateRecentList(list, value, index, maxCount);
}

function updateRecentWorkspaces(
  list: Array<RecentWorkspaceData>,
  value: RecentWorkspaceData,
  maxCount = 10
): Array<RecentWorkspaceData> {
  let index: undefined | number = undefined;

  // Search for matching item in the list.
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item.name === value.name) {
      index = i;
      break;
    }
  }

  return updateRecentList(list, value, index, maxCount);
}

function updateRecentList<T>(
  list: Array<T>,
  value: T,
  index?: number,
  maxCount = 10
): Array<T> {
  if (index !== undefined) {
    // Already in recent, shift to the beginning of the list.
    if (index > 0) {
      list = [value, ...list.slice(0, index), ...list.slice(index + 1)];
    }
  } else {
    // Add newest to the beginning of the list.
    list.unshift(value);

    // Trim old values.
    list = list.slice(0, maxCount - 1) || [];
  }

  return list;
}
