import {
  DeviceData,
  FileData,
  LiveEditorApiComponent,
  ProjectData,
  UserData,
  WorkspaceData,
  catchError,
} from './api';
import {EditorFile} from './file';

/**
 * Track the references to the editor state.
 *
 * These is done as a property of a class so that it can be used
 * with part configs and always have access to the latest
 * value without each part having to request the same information.
 */
export class EditorState {
  /**
   * API for retrieving data for the editor.
   */
  api: LiveEditorApiComponent;
  /**
   * Array of devices supported for previews.
   */
  devices?: Array<DeviceData>;
  /**
   * Files in the project that can be edited by the editor.
   */
  files?: Array<FileData>;
  /**
   * Editor file loaded in the editor.
   */
  file?: EditorFile;
  /**
   * Project information.
   */
  project?: ProjectData;
  /**
   * Allow keeping track of active promises if parts want to keep
   * from actively requesting the same data at the same time.
   */
  promises: Record<string, Promise<any>>;
  /**
   * Users in the project that have access to the editor.
   */
  users?: Array<UserData>;
  /**
   * Workspace in use in the editor.
   */
  workspace?: WorkspaceData;
  /**
   * Workspaces available to use in the editor.
   */
  workspaces?: Array<WorkspaceData>;

  constructor(api: LiveEditorApiComponent) {
    this.api = api;
    this.promises = {};
  }

  getDevices(
    callback: (devices: Array<DeviceData>) => void
  ): Array<DeviceData> | undefined {
    const promiseKey = 'getDevices';
    if (this.promises[promiseKey]) {
      return;
    }
    this.promises[promiseKey] = this.api
      .getDevices()
      .then(data => {
        this.devices = data;
        delete this.promises[promiseKey];
        callback(data);
      })
      .catch(catchError);
    return this.devices;
  }

  getFiles(
    callback: (files: Array<FileData>) => void
  ): Array<FileData> | undefined {
    const promiseKey = 'getFiles';
    if (this.promises[promiseKey]) {
      return;
    }
    this.promises[promiseKey] = this.api
      .getFiles()
      .then(data => {
        this.files = data;
        delete this.promises[promiseKey];
        callback(data);
      })
      .catch(catchError);
    return this.files;
  }

  getProject(
    callback: (project: ProjectData) => void
  ): ProjectData | undefined {
    const promiseKey = 'getProject';
    if (this.promises[promiseKey]) {
      return;
    }
    this.promises[promiseKey] = this.api
      .getProject()
      .then(data => {
        this.project = data;
        delete this.promises[promiseKey];
        callback(data);
      })
      .catch(catchError);
    return this.project;
  }

  getUsers(
    callback: (files: Array<UserData>) => void
  ): Array<UserData> | undefined {
    const promiseKey = 'getUsers';
    if (this.promises[promiseKey]) {
      return;
    }
    this.promises[promiseKey] = this.api
      .getUsers()
      .then(data => {
        this.users = data;
        delete this.promises[promiseKey];
        callback(data);
      })
      .catch(catchError);
    return this.users;
  }

  getWorkspace(
    callback: (project: WorkspaceData) => void
  ): WorkspaceData | undefined {
    const promiseKey = 'getWorkspace';
    if (this.promises[promiseKey]) {
      return;
    }
    this.promises[promiseKey] = this.api
      .getWorkspace()
      .then(data => {
        this.workspace = data;
        delete this.promises[promiseKey];
        callback(data);
      })
      .catch(catchError);
    return this.workspace;
  }

  getWorkspaces(
    callback: (workspaces: Array<WorkspaceData>) => void
  ): Array<WorkspaceData> | undefined {
    const promiseKey = 'getUsers';
    if (this.promises[promiseKey]) {
      return;
    }
    this.promises[promiseKey] = this.api
      .getWorkspaces()
      .then(data => {
        this.workspaces = data;
        delete this.promises[promiseKey];
        callback(data);
      })
      .catch(catchError);
    return this.workspaces;
  }

  loadWorkspace(
    workspace: WorkspaceData,
    callback: (workspace: WorkspaceData) => void
  ) {
    this.api
      .loadWorkspace(workspace)
      .then((workspace: WorkspaceData) => {
        this.workspace = workspace;
        callback(workspace);
      })
      .catch(catchError);
  }
}
