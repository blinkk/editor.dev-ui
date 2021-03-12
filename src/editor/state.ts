import {
  ApiError,
  DeviceData,
  EditorFileData,
  FileData,
  LiveEditorApiComponent,
  ProjectData,
  PublishResult,
  SiteData,
  UserData,
  WorkspaceData,
  catchError,
} from './api';
import {EVENT_FILE_LOAD_COMPLETE, EVENT_RENDER} from './events';
import {Base} from '@blinkk/selective-edit/dist/src/mixins';
import {ListenersMixin} from '../mixin/listeners';

/**
 * Track the references to the editor state.
 *
 * These is done as a property of a class so that it can be used
 * with part configs and always have access to the latest
 * value without each part having to request the same information.
 */
export class EditorState extends ListenersMixin(Base) {
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
  file?: EditorFileData;
  /**
   * Project information.
   */
  project?: ProjectData;
  /**
   * Keep track of active promises to keep from requesting the same data
   * multiple times.
   */
  protected promises: Record<string, Promise<any>>;
  /**
   * Site configuration for the editor.
   */
  site?: SiteData;
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
    super();
    this.api = api;
    this.promises = {};
  }

  copyFile(
    originalPath: string,
    path: string,
    callback?: (file: FileData) => void,
    callbackError?: (error: ApiError) => void
  ) {
    this.api
      .copyFile(originalPath, path)
      .then(data => {
        if (callback) {
          callback(data);
        }
        // Reload the files.
        this.getFiles();
      })
      .catch(error => catchError(error, callbackError));
  }

  createFile(
    path: string,
    callback?: (file: FileData) => void,
    callbackError?: (error: ApiError) => void
  ) {
    this.api
      .createFile(path)
      .then(data => {
        if (callback) {
          callback(data);
        }
        // Reload the files.
        this.getFiles();
      })
      .catch(error => catchError(error, callbackError));
  }

  createWorkspace(
    base: WorkspaceData,
    workspace: string,
    callback?: (workspace: WorkspaceData) => void,
    callbackError?: (error: ApiError) => void
  ) {
    this.api
      .createWorkspace(base, workspace)
      .then(data => {
        if (callback) {
          callback(data);
        }
        // Reload the workspaces.
        this.getWorkspaces();
      })
      .catch(error => catchError(error, callbackError));
  }

  deleteFile(
    file: FileData,
    callback?: () => void,
    callbackError?: (error: ApiError) => void
  ) {
    this.api
      .deleteFile(file)
      .then(() => {
        if (callback) {
          callback();
        }
        // Reload the files.
        this.getFiles();
      })
      .catch(error => catchError(error, callbackError));
  }

  getDevices(
    callback?: (devices: Array<DeviceData>) => void,
    callbackError?: (error: ApiError) => void
  ): Array<DeviceData> | undefined {
    const promiseKey = 'getDevices';
    if (this.promises[promiseKey]) {
      return;
    }
    this.promises[promiseKey] = this.api
      .getDevices()
      .then(data => {
        if (!data.length) {
          this.devices = DEFAULT_DEVICES;
        } else {
          this.devices = data;
        }

        delete this.promises[promiseKey];
        if (callback) {
          callback(this.devices);
        }
        this.triggerListener(promiseKey);
        this.render();
      })
      .catch(error => catchError(error, callbackError));
    return this.devices;
  }

  getFile(
    file: FileData,
    callback?: (file: EditorFileData) => void,
    callbackError?: (error: ApiError) => void
  ): EditorFileData | undefined {
    const promiseKey = 'getFile';
    if (this.promises[promiseKey]) {
      return;
    }
    this.promises[promiseKey] = this.api
      .getFile(file)
      .then(data => {
        this.file = data;
        delete this.promises[promiseKey];
        if (callback) {
          callback(data);
        }
        this.triggerListener(promiseKey);
        document.dispatchEvent(new CustomEvent(EVENT_FILE_LOAD_COMPLETE));
        this.render();
      })
      .catch(error => catchError(error, callbackError));
    return this.file;
  }

  getFiles(
    callback?: (files: Array<FileData>) => void,
    callbackError?: (error: ApiError) => void
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
        if (callback) {
          callback(data);
        }
        this.triggerListener(promiseKey);
        this.render();
      })
      .catch(error => catchError(error, callbackError));
    return this.files;
  }

  getProject(
    callback?: (project: ProjectData) => void,
    callbackError?: (error: ApiError) => void
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
        if (callback) {
          callback(data);
        }
        this.triggerListener(promiseKey);
        this.render();
      })
      .catch(error => catchError(error, callbackError));
    return this.project;
  }

  getSite(
    callback?: (site: SiteData) => void,
    callbackError?: (error: ApiError) => void
  ): SiteData | undefined {
    const promiseKey = 'getSite';
    if (this.promises[promiseKey]) {
      return;
    }
    this.promises[promiseKey] = this.api
      .getSite()
      .then(data => {
        this.site = data;
        delete this.promises[promiseKey];
        if (callback) {
          callback(data);
        }
        this.triggerListener(promiseKey);
        this.render();
      })
      .catch(error => catchError(error, callbackError));
    return this.site;
  }

  getUsers(
    callback?: (files: Array<UserData>) => void,
    callbackError?: (error: ApiError) => void
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
        if (callback) {
          callback(data);
        }
        this.triggerListener(promiseKey);
        this.render();
      })
      .catch(error => catchError(error, callbackError));
    return this.users;
  }

  getWorkspace(
    callback?: (project: WorkspaceData) => void,
    callbackError?: (error: ApiError) => void
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
        if (callback) {
          callback(data);
        }
        this.triggerListener(promiseKey);
        this.render();
      })
      .catch(error => catchError(error, callbackError));
    return this.workspace;
  }

  getWorkspaces(
    callback?: (workspaces: Array<WorkspaceData>) => void,
    callbackError?: (error: ApiError) => void
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
        if (callback) {
          callback(data);
        }
        this.triggerListener(promiseKey);
        this.render();
      })
      .catch(error => catchError(error, callbackError));
    return this.workspaces;
  }

  loadWorkspace(
    workspace: WorkspaceData,
    callback?: (workspace: WorkspaceData) => void,
    callbackError?: (error: ApiError) => void
  ) {
    this.api
      .loadWorkspace(workspace)
      .then((data: WorkspaceData) => {
        this.workspace = data;
        if (callback) {
          callback(data);
        }
        this.render();
      })
      .catch(error => catchError(error, callbackError));
  }

  publish(
    workspace: WorkspaceData,
    data: Record<string, any>,
    callback?: (result: PublishResult) => void,
    callbackError?: (error: ApiError) => void
  ) {
    this.api
      .publish(workspace, data)
      .then((result: PublishResult) => {
        if (callback) {
          callback(result);
        }
        this.render();
      })
      .catch(error => catchError(error, callbackError));
  }

  /**
   * Signal for the editor to re-render.
   */
  render() {
    document.dispatchEvent(new CustomEvent(EVENT_RENDER));
  }

  saveFile(
    file: EditorFileData,
    callback?: (file: EditorFileData) => void,
    callbackError?: (error: ApiError) => void
  ) {
    const promiseKey = 'saveFile';
    if (this.promises[promiseKey]) {
      return;
    }
    this.promises[promiseKey] = this.api
      .saveFile(file)
      .then(data => {
        this.file = data;
        delete this.promises[promiseKey];
        if (callback) {
          callback(data);
        }
        this.triggerListener(promiseKey);
        document.dispatchEvent(new CustomEvent(EVENT_FILE_LOAD_COMPLETE));
        this.render();
      })
      .catch(error => catchError(error, callbackError));
  }
}

export const DEFAULT_DEVICES = [
  {
    label: 'Mobile',
    width: 411,
    height: 731,
    canRotate: true,
  } as DeviceData,
  {
    label: 'Tablet',
    width: 1024,
    height: 768,
    canRotate: true,
  } as DeviceData,
  {
    label: 'Desktop',
    width: 1440,
  } as DeviceData,
];
