import {
  ApiError,
  DeviceData,
  EditorFileData,
  EditorPreviewSettings,
  FileData,
  LiveEditorApiComponent,
  MediaOptions,
  PreviewRoutesLocaleData,
  PreviewRoutesMetaData,
  PreviewSettings,
  ProjectData,
  PublishResult,
  SiteData,
  UserData,
  WorkspaceData,
  catchError,
} from './api';
import {
  EVENT_FILE_LOAD_COMPLETE,
  EVENT_FILE_SAVE_COMPLETE,
  EVENT_RENDER,
} from './events';
import {AmagakiState} from '../projectType/amagaki/amagakiState';
import {Base} from '@blinkk/selective-edit/dist/mixins';
import {FeatureManager} from '../utility/featureManager';
import {GrowState} from '../projectType/grow/growState';
import {ListenersMixin} from '../mixin/listeners';
import {interpolatePreviewBaseUrl} from './preview';

export enum StatePromiseKeys {
  GetDevices = 'GetDevices',
  GetFile = 'GetFile',
  GetFiles = 'GetFiles',
  GetPreviewConfig = 'GetPreviewConfig',
  GetProject = 'GetProject',
  GetWorkspace = 'GetWorkspace',
  GetWorkspaces = 'GetWorkspaces',
  SaveFile = 'SaveFile',
}

const REGEX_START_SLASH = /^\//i;

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
   * Editor experiments mangager.
   */
  experiments: FeatureManager;
  /**
   * Editor feature mangager.
   */
  features: FeatureManager;
  /**
   * Files in the project that can be edited by the editor.
   */
  files?: Array<FileData>;
  /**
   * Editor file loaded in the editor.
   */
  file?: EditorFileData;
  /**
   * Path being actively loaded.
   *
   * Only set when a file is being loaded.
   */
  loadingFilePath?: string;
  /**
   * Preview server settings.
   */
  previewConfig?: PreviewSettings | null;
  /**
   * Project information.
   */
  project?: ProjectData;
  /**
   * Project types states.
   */
  projectTypes: StateProjectTypes;
  /**
   * Keep track of active promises to keep from requesting the same data
   * multiple times.
   */
  protected promises: Record<string, Promise<any> | boolean>;
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

    // Features are on by default.
    this.features = new FeatureManager({
      defaultStatus: true,
    });

    // Experiments are off by default.
    this.experiments = new FeatureManager({
      defaultStatus: false,
    });

    this.projectTypes = {
      amagaki: new AmagakiState(this),
      grow: new GrowState(this),
    };
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
        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();

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
        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();

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
        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();

        if (callback) {
          callback();
        }
        // Reload the files.
        this.getFiles();
      })
      .catch(error => catchError(error, callbackError));
  }

  /**
   * When loading a file the url may not be defined and needs to be verified.
   * If a preview server is defined in the project config the preview server
   * settings are loaded to check for a url defined by the preview server.
   */
  protected ensureFileUrl() {
    // If there is no url for the file, check if the preview server
    // knows how to preview the file.
    if (this.file && !this.file.url) {
      const originalPath = this.file.file.path;
      const updateFileUrl = (previewSettings: PreviewSettings | null) => {
        // If the path has changed then we have moved on, nothing to see here.
        if (originalPath !== this.file?.file.path) {
          return;
        }

        if (
          previewSettings &&
          this.file?.file.path &&
          this.file?.file.path in previewSettings.routes
        ) {
          const baseUrl = interpolatePreviewBaseUrl(
            this.project?.preview as EditorPreviewSettings,
            this.workspace as WorkspaceData
          );
          const route = previewSettings.routes[this.file?.file.path];

          if ((route as PreviewRoutesMetaData).path) {
            this.file.url = `${baseUrl}${(
              route as PreviewRoutesMetaData
            ).path.replace(REGEX_START_SLASH, '')}`;
          } else {
            this.file.url = `${baseUrl}${(route as PreviewRoutesLocaleData)[
              previewSettings.defaultLocale
            ].path.replace(REGEX_START_SLASH, '')}`;
          }

          this.render();
        }
      };

      if (this.previewConfig === undefined) {
        this.getPreviewConfig(updateFileUrl);
      } else {
        updateFileUrl(this.previewConfig);
      }
    }
  }

  /**
   * When uploading a file the local field is allowed to override the default
   * remote configuration. If the `remote` config is undefined no options are
   * specified and can use the global configurations to determine which
   * configuration should be used.
   */
  getMediaOptions(useRemote?: boolean): MediaOptions | undefined {
    if (useRemote === true) {
      return this.project?.media?.remote;
    } else if (useRemote === false) {
      return this.project?.media?.options;
    }

    if (this.project?.media?.remote?.isDefault) {
      return this.project?.media?.remote;
    }

    return this.project?.media?.options;
  }

  getDevices(
    callback?: (devices: Array<DeviceData>) => void,
    callbackError?: (error: ApiError) => void
  ): Array<DeviceData> | undefined {
    const promiseKey = StatePromiseKeys.GetDevices;
    if (this.inProgress(promiseKey)) {
      handleDelayedCallback(this.promises[promiseKey], callback);
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
    const promiseKey = StatePromiseKeys.GetFile;
    if (this.inProgress(promiseKey)) {
      handleDelayedCallback(this.promises[promiseKey], callback);
      return;
    }

    this.promises[promiseKey] = this.api
      .getFile(file)
      .then(data => {
        this.file = data;
        delete this.promises[promiseKey];

        // Update the file url as it may not be not defined.
        this.ensureFileUrl();

        // Loading is complete, remove the loading file information.
        this.loadingFilePath = undefined;

        if (callback) {
          callback(this.file);
        }

        this.triggerListener(promiseKey);
        document.dispatchEvent(new CustomEvent(EVENT_FILE_LOAD_COMPLETE));
        this.render();
      })
      .catch(error => catchError(error, callbackError));

    // Unset the existing file since it is 'unloaded'.
    this.file = undefined;

    // Mark the file path that is being loaded.
    this.loadingFilePath = file.path;

    return this.file;
  }

  getFiles(
    callback?: (files: Array<FileData>) => void,
    callbackError?: (error: ApiError) => void
  ): Array<FileData> | undefined {
    const promiseKey = StatePromiseKeys.GetFiles;
    if (this.inProgress(promiseKey)) {
      handleDelayedCallback(this.promises[promiseKey], callback);
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
        this.triggerListener(promiseKey, data);
        this.render();
      })
      .catch(error => catchError(error, callbackError));
    return this.files;
  }

  getPreviewConfig(
    callback?: (previewSettings: PreviewSettings | null) => void,
    callbackError?: (error: ApiError) => void
  ): PreviewSettings | null | undefined {
    const promiseKey = StatePromiseKeys.GetPreviewConfig;

    // TODO: This promise may be delayed if the project or workspace
    // is not loaded, so this may be requested multiple times in a row.
    if (this.inProgress(promiseKey)) {
      handleDelayedCallback(this.promises[promiseKey], callback);
      return;
    }

    const handlePreviewSettings = (data: PreviewSettings | null) => {
      this.previewConfig = data;
      delete this.promises[promiseKey];

      if (callback) {
        callback(data);
      }
      this.triggerListener(promiseKey);
      this.render();
    };

    const handleWorkspace = (
      project: ProjectData,
      workspace: WorkspaceData
    ) => {
      this.promises[promiseKey] = this.api
        .getPreviewConfig(project.preview as EditorPreviewSettings, workspace)
        .then(handlePreviewSettings)
        .catch(error => catchError(error, callbackError));
    };

    const handleProject = (project: ProjectData) => {
      // If there is no preview configuration, no preview
      // server configured, so ignore the previewing config.
      if (!project.preview) {
        handlePreviewSettings(null);
        return;
      }

      if (!this.workspace) {
        this.getWorkspace((workspace: WorkspaceData) => {
          handleWorkspace(project, workspace);
        });
        return;
      }

      handleWorkspace(project, this.workspace);
    };

    // Mark that the process is in flight.
    // Not a true promise until the actual request is made later.
    this.promises[promiseKey] = true;

    // Project needs to be loaded first.
    if (!this.project) {
      this.getProject(handleProject);
    } else {
      handleProject(this.project);
    }

    return this.previewConfig;
  }

  getProject(
    callback?: (project: ProjectData) => void,
    callbackError?: (error: ApiError) => void
  ): ProjectData | undefined {
    const promiseKey = StatePromiseKeys.GetProject;
    if (this.inProgress(promiseKey)) {
      handleDelayedCallback(this.promises[promiseKey], callback);
      return;
    }
    this.promises[promiseKey] = this.api
      .getProject()
      .then(data => {
        this.project = data;
        delete this.promises[promiseKey];

        // Pull in the feature flags and settings.
        if (this.project.features) {
          for (const key of Object.keys(this.project.features)) {
            this.features.set(key, this.project.features[key]);
          }
        }

        // Pull in the experiment flags and settings.
        if (this.project.experiments) {
          for (const key of Object.keys(this.project.experiments)) {
            this.experiments.set(key, this.project.experiments[key]);
          }
        }

        if (callback) {
          callback(this.project);
        }
        this.triggerListener(promiseKey);
        this.render();
      })
      .catch(error => catchError(error, callbackError));
    return this.project;
  }

  getWorkspace(
    callback?: (project: WorkspaceData) => void,
    callbackError?: (error: ApiError) => void
  ): WorkspaceData | undefined {
    const promiseKey = StatePromiseKeys.GetWorkspace;
    if (this.inProgress(promiseKey)) {
      handleDelayedCallback(this.promises[promiseKey], callback);
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
    const promiseKey = StatePromiseKeys.GetWorkspaces;
    if (this.inProgress(promiseKey)) {
      handleDelayedCallback(this.promises[promiseKey], callback);
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

  /**
   * Determines if there is an existing promise for a given key.
   *
   * @param key Key identifying the promise or loading status.
   */
  inProgress(key: string): boolean {
    return key in this.promises;
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

        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();
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
        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();

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
    isRawEdit: boolean,
    callback?: (file: EditorFileData) => void,
    callbackError?: (error: ApiError) => void
  ) {
    const promiseKey = StatePromiseKeys.SaveFile;
    if (this.inProgress(promiseKey)) {
      handleDelayedCallback(this.promises[promiseKey], callback);
      return;
    }

    this.promises[promiseKey] = this.api
      .saveFile(file, isRawEdit)
      .then(data => {
        this.file = data;
        delete this.promises[promiseKey];

        // Update the file url as it may not be not defined.
        this.ensureFileUrl();

        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();

        if (callback) {
          callback(data);
        }
        this.triggerListener(promiseKey);
        document.dispatchEvent(new CustomEvent(EVENT_FILE_LOAD_COMPLETE));
        document.dispatchEvent(new CustomEvent(EVENT_FILE_SAVE_COMPLETE));
        this.render();
      })
      .catch(error => catchError(error, callbackError));
  }
}

export interface StateProjectTypes {
  amagaki: AmagakiState;
  grow: GrowState;
}

export const DEFAULT_DEVICES = [
  {
    label: 'Phone',
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

function handleDelayedCallback<T>(
  promise: Promise<T> | boolean,
  callback?: (value: T) => void
) {
  if (callback && promise !== true && promise !== false) {
    (promise as unknown as Promise<T>).then(data => {
      callback(data);
    });
  }
}
