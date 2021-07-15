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
import {DataStorage, LocalDataStorage} from '../utility/dataStorage';
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
import {ProjectTypeComponent} from '../projectType/projectType';
import {interpolatePreviewBaseUrl} from './preview';

const REGEX_START_SLASH = /^\//i;
const STORAGE_SCHEME = 'live.scheme';

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
   * Keep track of backlogged callbacks.
   */
  protected callbacks: Record<string, Set<(...value: any) => void>>;
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
   * Project type in use.
   */
  projectType?: ProjectTypeComponent;
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
   * Whether the user prefers dark mode.
   */
  prefersDarkScheme: boolean;
  /**
   * Scheme for the UI.
   */
  scheme?: Schemes | string;
  /**
   * Site configuration for the editor.
   */
  site?: SiteData;
  protected storage: DataStorage;
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
    this.callbacks = {};
    this.storage = new LocalDataStorage();

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

    // Load the preferred scheme.
    this.prefersDarkScheme =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.scheme = this.storage.getItem(STORAGE_SCHEME) || '';
  }

  copyFile(
    originalPath: string,
    path: string,
    callback?: (file: FileData) => void,
    callbackError?: (error: ApiError) => void
  ) {
    const promiseKey = StatePromiseKeys.CopyFile;
    this.delayCallback(promiseKey, callback);
    this.api
      .copyFile(originalPath, path)
      .then(data => {
        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();

        this.handleDataAndCleanup(promiseKey, data);

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
    const promiseKey = StatePromiseKeys.CreateFile;
    this.delayCallback(promiseKey, callback);
    this.api
      .createFile(path)
      .then(data => {
        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();

        this.handleDataAndCleanup(promiseKey, data);
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
    const promiseKey = StatePromiseKeys.CreateWorkspace;
    this.delayCallback(promiseKey, callback);
    this.api
      .createWorkspace(base, workspace)
      .then(data => {
        this.handleDataAndCleanup(promiseKey, data);
        // Reload the workspaces.
        this.getWorkspaces();
      })
      .catch(error => catchError(error, callbackError));
  }

  /**
   * When a callback is specified for a state load it does not
   * always have a promise to bind to. Store the callback to be
   * manually be completed after the promise is complete.
   *
   * @param promiseKey Key to identify the stored promise.
   * @param callback Callback after the promise is completed.
   */
  protected delayCallback(promiseKey: string, callback?: (value: any) => void) {
    if (!callback) {
      return;
    }

    this.callbacks[promiseKey] = this.callbacks[promiseKey] ?? new Set();
    this.callbacks[promiseKey].add(callback);
  }

  deleteFile(
    file: FileData,
    callback?: () => void,
    callbackError?: (error: ApiError) => void
  ) {
    const promiseKey = StatePromiseKeys.DeleteFile;
    this.delayCallback(promiseKey, callback);

    this.api
      .deleteFile(file)
      .then(() => {
        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();

        this.handleDataAndCleanup(promiseKey, callback);
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
    this.delayCallback(promiseKey, callback);
    if (this.inProgress(promiseKey)) {
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

        this.handleDataAndCleanup(promiseKey, this.devices);
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
    this.delayCallback(promiseKey, callback);
    if (this.inProgress(promiseKey)) {
      return;
    }

    // Start the loading of the preview configuration before waiting
    // for a full file load response.
    if (this.previewConfig === undefined) {
      this.getPreviewConfig();
    }

    this.promises[promiseKey] = this.api
      .getFile(file)
      .then(data => {
        this.file = data;

        // Update the file url as it may not be not defined.
        this.ensureFileUrl();

        // Loading is complete, remove the loading file information.
        this.loadingFilePath = undefined;

        this.handleDataAndCleanup(promiseKey, this.file);
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
    this.delayCallback(promiseKey, callback);
    if (this.inProgress(promiseKey)) {
      return;
    }
    this.promises[promiseKey] = this.api
      .getFiles()
      .then(data => {
        this.files = data;
        this.handleDataAndCleanup(promiseKey, data);
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
    this.delayCallback(promiseKey, callback);
    if (this.inProgress(promiseKey)) {
      return;
    }

    const handlePreviewSettings = (data: PreviewSettings | null) => {
      this.previewConfig = data;
      this.handleDataAndCleanup(promiseKey, data);
      this.render();
    };

    const handleWorkspace = (
      project: ProjectData,
      workspace: WorkspaceData
    ) => {
      this.promises[promiseKey] = this.api
        .getPreviewConfig(project.preview as EditorPreviewSettings, workspace)
        .then(handlePreviewSettings)
        .catch((err: Error) => {
          if (callbackError) {
            callbackError({
              message: err.toString(),
              details: err,
            });
          }

          console.error('Unable to load preview server config');
          this.previewConfig = null;
          this.render();
        });
    };

    const handleProject = (project: ProjectData) => {
      // If there is no preview configuration, no preview
      // server configured, so ignore the previewing config.
      if (!project?.preview) {
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
    this.delayCallback(promiseKey, callback);
    if (this.inProgress(promiseKey)) {
      return;
    }
    this.promises[promiseKey] = this.api
      .getProject()
      .then(data => {
        this.project = data;

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

        this.handleDataAndCleanup(promiseKey, this.project);
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
    this.delayCallback(promiseKey, callback);
    if (this.inProgress(promiseKey)) {
      return;
    }
    this.promises[promiseKey] = this.api
      .getWorkspace()
      .then(data => {
        this.workspace = data;
        this.handleDataAndCleanup(promiseKey, data);
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
    this.delayCallback(promiseKey, callback);
    if (this.inProgress(promiseKey)) {
      return;
    }
    this.promises[promiseKey] = this.api
      .getWorkspaces()
      .then(data => {
        this.workspaces = data;
        this.handleDataAndCleanup(promiseKey, data);
        this.render();
      })
      .catch(error => catchError(error, callbackError));
    return this.workspaces;
  }

  /**
   * After a promise is completed handle the cleanup and trigger
   * listeners and callbacks appropriately.
   *
   * @param promiseKey Key to identify the promise.
   * @param callback Optional callback for when the process is completed.
   * @param values Data to be passed along for the promise results.
   */
  protected handleDataAndCleanup(promiseKey: string, ...values: any) {
    delete this.promises[promiseKey];
    const callbacks = this.callbacks[promiseKey] ?? new Set();
    delete this.callbacks[promiseKey];
    for (const callback of callbacks) {
      callback(...values);
    }
    this.triggerListener(promiseKey, ...values);
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
    const promiseKey = StatePromiseKeys.LoadWorkspace;
    this.delayCallback(promiseKey, callback);
    this.api
      .loadWorkspace(workspace)
      .then((data: WorkspaceData) => {
        this.workspace = data;

        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();
        this.handleDataAndCleanup(promiseKey, data);
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
    const promiseKey = StatePromiseKeys.Publish;
    this.delayCallback(promiseKey, callback);
    this.api
      .publish(workspace, data)
      .then((result: PublishResult) => {
        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();

        this.handleDataAndCleanup(promiseKey, result);
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
    this.delayCallback(promiseKey, callback);
    if (this.inProgress(promiseKey)) {
      return;
    }

    this.promises[promiseKey] = this.api
      .saveFile(file, isRawEdit)
      .then(data => {
        this.file = data;

        // Update the file url as it may not be not defined.
        this.ensureFileUrl();

        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();

        this.handleDataAndCleanup(promiseKey, data);
        document.dispatchEvent(new CustomEvent(EVENT_FILE_LOAD_COMPLETE));
        document.dispatchEvent(new CustomEvent(EVENT_FILE_SAVE_COMPLETE));
        this.render();
      })
      .catch(error => catchError(error, callbackError));
  }

  /**
   * Sets the color scheme to use for the UI.
   *
   * @param scheme Scheme to use for the UI.
   */
  setScheme(scheme: Schemes) {
    this.scheme = scheme;
    this.triggerListener(StatePromiseKeys.SetScheme, this.scheme);

    if (
      (scheme === Schemes.Light && !this.prefersDarkScheme) ||
      (scheme === Schemes.Dark && this.prefersDarkScheme)
    ) {
      // If the new scheme is the same as the preferred scheme
      // remove the storage item so that changing the preferred
      // scheme correctly changes the color scheme.
      this.storage.removeItem(STORAGE_SCHEME);
    } else {
      // Store when using a scheme that is not the preferred.
      this.storage.setItem(STORAGE_SCHEME, scheme);
    }
  }

  setProjectType(projectType: ProjectTypeComponent) {
    this.projectType = projectType;
    this.triggerListener(StatePromiseKeys.SetProjectType, this.projectType);
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

/**
 * Schemes available for the editor UI.
 */
export enum Schemes {
  Light = 'Light',
  Dark = 'Dark',
}

/**
 * Promise keys used for tracking in operation promises for the state.
 */
export enum StatePromiseKeys {
  CopyFile = 'CopyFile',
  CreateFile = 'CreateFile',
  CreateWorkspace = 'CreateWorkspace',
  DeleteFile = 'DeleteFile',
  GetDevices = 'GetDevices',
  GetFile = 'GetFile',
  GetFiles = 'GetFiles',
  GetPreviewConfig = 'GetPreviewConfig',
  GetProject = 'GetProject',
  GetWorkspace = 'GetWorkspace',
  GetWorkspaces = 'GetWorkspaces',
  LoadWorkspace = 'LoadWorkspace',
  Publish = 'Publish',
  SaveFile = 'SaveFile',
  SetScheme = 'SetScheme',
  SetProjectType = 'SetProjectType',
}
