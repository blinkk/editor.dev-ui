import {
  ApiError,
  ApiErrorCode,
  AuthenticationData,
  DeviceData,
  EditorFileData,
  EditorPreviewSettings,
  FileData,
  LiveEditorApiComponent,
  MediaOptions,
  OnboardingInfo,
  OnboardingStatus,
  PreviewRoutesLocaleData,
  PreviewRoutesMetaData,
  PreviewSettings,
  ProjectData,
  ProjectSource,
  PublishResult,
  SiteData,
  UserData,
  WorkspaceData,
  catchError,
} from './api';
import {DataStorage, LocalDataStorage} from '../utility/dataStorage';
import {
  EVENT_FILE_CREATE,
  EVENT_FILE_LOAD,
  EVENT_FILE_LOAD_COMPLETE,
  EVENT_FILE_SAVE_COMPLETE,
  EVENT_ONBOARDING_UPDATE,
  EVENT_REFRESH_FILE,
  EVENT_RENDER,
} from './events';
import {announceNotification, readNotification} from './ui/parts/notifications';

import {AmagakiState} from '../projectType/amagaki/amagakiState';
import {Base} from '@blinkk/selective-edit/dist/mixins';
import {EditorHistory} from './recent';
import {FeatureManager} from '../utility/featureManager';
import {GrowState} from '../projectType/grow/growState';
import {ListenersMixin} from '../mixin/listeners';
import {ProjectTypeComponent} from '../projectType/projectType';
import {interpolatePreviewUrl} from './preview';

const REGEX_START_SLASH = /^\//i;
export const STORAGE_SCHEME = 'live.scheme';

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
   * Information about the authentication for account management.
   */
  authentication?: AuthenticationData | null;
  /**
   * Array of devices supported for previews.
   */
  devices?: Array<DeviceData>;
  /**
   * Keep track of backlogged error callbacks.
   */
  protected errorCallbacks: Record<string, Set<(...value: any) => void>>;
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
   *
   * Value is null when fails to load.
   */
  files?: Array<FileData> | null;
  /**
   * Editor file loaded in the editor.
   *
   * Value is null when the file is not found or fails to load.
   */
  file?: EditorFileData | null;
  /**
   * File preview url
   */
  filePreviewUrl?: string | null;
  /**
   * Editor history.
   */
  history: EditorHistory;
  /**
   * Path being actively loaded.
   *
   * Only set when a file is being loaded.
   */
  loadingFilePath?: string;
  /**
   * Current onboarding status.
   */
  onboardingInfo?: OnboardingInfo;
  /**
   * Pending file waiting to be loaded.
   *
   * When the editor loads the path information is determined from
   * the URL, but the file cannot be loaded until the onboarding
   * process is complete. The path is stored to be loaded after the
   * onboarding is complete.
   */
  pendingFile?: FileData;
  /**
   * Preview server settings.
   *
   * Value is null when fails to load.
   */
  previewConfig?: PreviewSettings | null;
  /**
   * Project type in use.
   */
  projectType?: ProjectTypeComponent;
  /**
   * Project information.
   *
   * Value is null when fails to load.
   */
  project?: ProjectData | null;
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
   * Keep track of backlogged success callbacks.
   */
  protected successCallbacks: Record<string, Set<(...value: any) => void>>;
  /**
   * Users in the project that have access to the editor.
   */
  users?: Array<UserData>;
  /**
   * Workspace in use in the editor.
   *
   * Value is null when fails to load.
   */
  workspace?: WorkspaceData | null;
  /**
   * Workspaces available to use in the editor.
   *
   * Value is null when fails to load.
   */
  workspaces?: Array<WorkspaceData> | null;

  constructor(api: LiveEditorApiComponent) {
    super();
    this.api = api;
    this.promises = {};
    this.errorCallbacks = {};
    this.successCallbacks = {};
    this.storage = new LocalDataStorage();
    this.history = new EditorHistory({
      storage: this.storage,
    });

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

    // Listen for file creation events.
    document.addEventListener(EVENT_FILE_CREATE, (evt: Event) => {
      const customEvent: CustomEvent = evt as CustomEvent;
      this.createFile(customEvent.detail.path);
      this.render();
    });

    // Listen for a load file event and load the file.
    document.addEventListener(EVENT_FILE_LOAD, (evt: Event) => {
      const customEvent: CustomEvent = evt as CustomEvent;
      this.getFile(customEvent.detail as FileData);
      this.render();
    });

    // Listen for a onboarding status updates.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    document.addEventListener(EVENT_ONBOARDING_UPDATE, (evt: Event) => {
      this.checkOnboarding();
    });

    // Listen for file refreshing.
    document.addEventListener(EVENT_REFRESH_FILE, () => {
      // Reload the current file.
      if (this.file) {
        this.getFile(this.file.file);
      }
    });
  }

  /**
   * Lazy load of authentication data.
   *
   * Understands the null state when there is an error requesting.
   */
  authenticationOrGetAuthentication(): AuthenticationData | undefined | null {
    if (
      this.authentication === undefined &&
      !this.inProgress(StatePromiseKeys.GetAuthentication)
    ) {
      this.getAuthentication();
    }
    return this.authentication;
  }

  checkOnboarding(
    callback?: (info: OnboardingInfo) => void,
    callbackError?: (error: ApiError) => void
  ) {
    const promiseKey = StatePromiseKeys.CheckOnboarding;
    this.delayCallbacks(promiseKey, callback, callbackError);
    this.api
      .checkOnboarding()
      .then(data => {
        this.onboardingInfo = data;
        this.processPendingFilePath();
        this.handleDataAndCleanup(promiseKey, data);
      })
      .catch((error: ApiError) =>
        this.handleErrorAndCleanup(promiseKey, error)
      );
  }

  copyFile(
    originalPath: string,
    path: string,
    callback?: (file: FileData) => void,
    callbackError?: (error: ApiError) => void
  ) {
    const promiseKey = StatePromiseKeys.CopyFile;
    this.delayCallbacks(promiseKey, callback, callbackError);
    this.api
      .copyFile(originalPath, path)
      .then(data => {
        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();

        // Reload the preview server config.
        this.getPreviewConfig();

        // Reload the files.
        this.getFiles();

        this.handleDataAndCleanup(promiseKey, data);
      })
      .catch((error: ApiError) => {
        this.handleErrorAndCleanup(promiseKey, error);
      });
  }

  createFile(
    path: string,
    callback?: (file: FileData) => void,
    callbackError?: (error: ApiError) => void
  ) {
    const promiseKey = StatePromiseKeys.CreateFile;
    this.delayCallbacks(promiseKey, callback, callbackError);
    this.api
      .createFile(path)
      .then(data => {
        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();

        // Reload the preview server config.
        this.getPreviewConfig();

        // Reload the files.
        this.getFiles();

        this.handleDataAndCleanup(promiseKey, data);
      })
      .catch((error: ApiError) =>
        this.handleErrorAndCleanup(promiseKey, error)
      );
  }

  createWorkspace(
    base: WorkspaceData,
    workspace: string,
    callback?: (workspace: WorkspaceData) => void,
    callbackError?: (error: ApiError) => void
  ) {
    const promiseKey = StatePromiseKeys.CreateWorkspace;
    this.delayCallbacks(promiseKey, callback, callbackError);
    this.api
      .createWorkspace(base, workspace)
      .then(data => {
        this.handleDataAndCleanup(promiseKey, data);
        // Reload the workspaces.
        this.getWorkspaces();
      })
      .catch((error: ApiError) =>
        this.handleErrorAndCleanup(promiseKey, error)
      );
  }

  /**
   * When a callback is specified for a state load it does not
   * always have a promise to bind to. Store the callback to be
   * manually be completed after the promise is complete.
   *
   * @param promiseKey Key to identify the stored promise.
   * @param callback Callback after the promise is completed.
   */
  protected delayCallbacks(
    promiseKey: string,
    callback?: (value: any) => void,
    errorCallback?: (value: any) => void
  ) {
    if (callback) {
      this.successCallbacks[promiseKey] =
        this.successCallbacks[promiseKey] ?? new Set();
      this.successCallbacks[promiseKey].add(callback);
    }
    if (errorCallback) {
      this.errorCallbacks[promiseKey] =
        this.errorCallbacks[promiseKey] ?? new Set();
      this.errorCallbacks[promiseKey].add(errorCallback);
    }
  }

  deleteFile(
    file: FileData,
    callback?: () => void,
    callbackError?: (error: ApiError) => void
  ) {
    const promiseKey = StatePromiseKeys.DeleteFile;
    this.delayCallbacks(promiseKey, callback, callbackError);

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
      .catch((error: ApiError) =>
        this.handleErrorAndCleanup(promiseKey, error)
      );
  }

  /**
   * Lazy load of files data.
   *
   * Understands the null state when there is an error requesting.
   */
  filesOrGetFiles(): Array<FileData> | undefined | null {
    if (
      this.files === undefined &&
      !this.inProgress(StatePromiseKeys.GetFiles)
    ) {
      this.getFiles();
    }
    return this.files;
  }

  /**
   * Get the authentication information to know how to handle accounts.
   *
   * Used to understand when and how to show account information.
   */
  getAuthentication(
    callback?: (devices: Array<DeviceData>) => void,
    callbackError?: (error: ApiError) => void
  ): AuthenticationData | undefined | null {
    const promiseKey = StatePromiseKeys.GetAuthentication;
    this.delayCallbacks(promiseKey, callback, callbackError);
    if (this.inProgress(promiseKey)) {
      return this.authentication;
    }
    this.promises[promiseKey] = this.api
      .getAuthentication()
      .then(data => {
        this.authentication = data;
        this.handleDataAndCleanup(promiseKey, this.authentication);
      })
      .catch((error: ApiError) => {
        this.authentication = null;
        this.handleErrorAndCleanup(promiseKey, error);
      });
    return this.authentication;
  }

  getDevices(
    callback?: (devices: Array<DeviceData>) => void,
    callbackError?: (error: ApiError) => void
  ): Array<DeviceData> | undefined {
    const promiseKey = StatePromiseKeys.GetDevices;
    this.delayCallbacks(promiseKey, callback, callbackError);
    if (this.inProgress(promiseKey)) {
      return this.devices;
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
      })
      .catch((error: ApiError) =>
        this.handleErrorAndCleanup(promiseKey, error)
      );
    return this.devices;
  }

  getFile(
    file: FileData,
    callback?: (file: EditorFileData) => void,
    callbackError?: (error: ApiError) => void
  ): EditorFileData | undefined | null {
    const promiseKey = StatePromiseKeys.GetFile;
    this.delayCallbacks(promiseKey, callback, callbackError);

    // TODO: Check if the file being loaded is the same file.
    if (this.inProgress(promiseKey)) {
      return this.file;
    }

    // If the onboarding is not complete wait for the onboarding process
    // before loading the file.
    if (
      !this.onboardingInfo ||
      this.onboardingInfo.status === OnboardingStatus.Missing
    ) {
      this.pendingFile = file;
      return;
    }

    // Update the preview url for the path.
    this.updateFilePreviewUrl(file.path);

    this.promises[promiseKey] = this.api
      .getFile(file)
      .then(data => {
        this.file = data;

        // Loading is complete, remove the loading file information.
        this.loadingFilePath = undefined;

        // Update document title.
        this.updateTitle();

        // Add the file to the project history.
        if (
          this.projectId &&
          // Local projects do not have a good unique identifier except the
          // file path and do not want to use the file path as an identifier.
          this.project?.source?.source !== ProjectSource.Local
        ) {
          const projectHistory = this.history.getProject(this.projectId);
          const fileHistory = {
            path: file.path,
            lastVisited: new Date().toISOString(),
          };
          if (this.workspace) {
            projectHistory.addRecentFile(this.workspace.name, fileHistory);
          } else {
            this.getWorkspace(() => {
              if (!this.workspace) {
                console.error('Unable to add file history, missing workspace.');
                return;
              }
              projectHistory.addRecentFile(this.workspace.name, fileHistory);
            });
          }
        }

        this.handleDataAndCleanup(promiseKey, this.file);

        document.dispatchEvent(new CustomEvent(EVENT_FILE_LOAD_COMPLETE));
      })
      .catch((error: ApiError) => {
        if (error.errorCode === ApiErrorCode.FileNotFound) {
          this.file = null;

          if (this.loadingFilePath) {
            error.actions = error.actions ?? [];

            error.actions.push({
              label: 'Create as new file',
              customEvent: EVENT_FILE_CREATE,
              details: file,
            });
          }

          this.handleErrorAndCleanup(promiseKey, error, {
            preventDefaultHandling: true,
          });
        } else {
          this.file = null;
          this.handleErrorAndCleanup(promiseKey, error);
        }
      });

    // Mark the file path that is being loaded.
    this.loadingFilePath = file.path;

    return this.file;
  }

  getFiles(
    callback?: (files: Array<FileData>) => void,
    callbackError?: (error: ApiError) => void
  ): Array<FileData> | undefined | null {
    const promiseKey = StatePromiseKeys.GetFiles;
    this.delayCallbacks(promiseKey, callback, callbackError);
    if (this.inProgress(promiseKey)) {
      return this.files;
    }
    this.promises[promiseKey] = this.api
      .getFiles()
      .then(data => {
        this.files = data;
        this.handleDataAndCleanup(promiseKey, data);
      })
      .catch((error: ApiError) => {
        this.files = null;
        this.handleErrorAndCleanup(promiseKey, error);
      });
    return this.files;
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

  getPreviewConfig(
    callback?: (previewSettings: PreviewSettings | null) => void,
    callbackError?: (error: ApiError) => void
  ): PreviewSettings | null | undefined {
    const promiseKey = StatePromiseKeys.GetPreviewConfig;
    this.delayCallbacks(promiseKey, callback, callbackError);
    if (this.inProgress(promiseKey)) {
      return this.previewConfig;
    }

    const handlePreviewSettings = (data: PreviewSettings | null) => {
      this.previewConfig = data;
      this.handleDataAndCleanup(promiseKey, data);
    };

    const handleWorkspace = (
      project: ProjectData,
      workspace: WorkspaceData
    ) => {
      this.promises[promiseKey] = this.api
        .getPreviewConfig(project.preview as EditorPreviewSettings, workspace)
        .then(handlePreviewSettings)
        .catch((error: ApiError) => {
          console.error('Unable to load preview server config');
          this.previewConfig = null;
          this.handleErrorAndCleanup(promiseKey, error, {
            preventDefaultHandling: true,
            preventNotification: true,
          });
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
    if (this.project === null) {
      console.error('Unable to load preview server config without project');
    } else if (!this.project) {
      this.getProject(handleProject);
    } else {
      handleProject(this.project);
    }

    return this.previewConfig;
  }

  getProject(
    callback?: (project: ProjectData) => void,
    callbackError?: (error: ApiError) => void
  ): ProjectData | undefined | null {
    const promiseKey = StatePromiseKeys.GetProject;
    this.delayCallbacks(promiseKey, callback, callbackError);
    if (this.inProgress(promiseKey)) {
      return this.project;
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

        // Update document title.
        this.updateTitle();

        // Add to recent project history.
        this.history.addRecentProject({
          avatarUrl: this.project.avatarUrl,
          identifier: this.project.source?.identifier || 'unknown',
          source: this.project.source?.source,
          label: this.project.source?.label || this.project.title,
          lastVisited: new Date().toISOString(),
        });

        this.handleDataAndCleanup(promiseKey, this.project);
      })
      .catch((error: ApiError) => {
        // Set value as null when there was an error.
        this.project = null;
        this.handleErrorAndCleanup(promiseKey, error);
      });
    return this.project;
  }

  getWorkspace(
    callback?: (workspace: WorkspaceData) => void,
    callbackError?: (error: ApiError) => void
  ): WorkspaceData | undefined | null {
    const promiseKey = StatePromiseKeys.GetWorkspace;
    this.delayCallbacks(promiseKey, callback, callbackError);
    if (this.inProgress(promiseKey)) {
      return this.workspace;
    }
    this.promises[promiseKey] = this.api
      .getWorkspace()
      .then(data => {
        this.workspace = data;

        // Update document title.
        this.updateTitle();

        // Add the workspace to the project history.
        if (
          this.projectId &&
          // Local projects do not have a good unique identifier except the
          // file path and do not want to use the file path as an identifier.
          this.project?.source?.source !== ProjectSource.Local
        ) {
          const projectHistory = this.history.getProject(this.projectId);
          projectHistory.addRecentWorkspace({
            name: this.workspace.name,
            lastVisited: new Date().toISOString(),
          });
        }

        this.handleDataAndCleanup(promiseKey, data);
      })
      .catch((error: ApiError) => {
        this.workspace = null;
        this.handleErrorAndCleanup(promiseKey, error);
      });
    return this.workspace;
  }

  getWorkspaces(
    callback?: (workspaces: Array<WorkspaceData>) => void,
    callbackError?: (error: ApiError) => void
  ): Array<WorkspaceData> | undefined | null {
    const promiseKey = StatePromiseKeys.GetWorkspaces;
    this.delayCallbacks(promiseKey, callback, callbackError);
    if (this.inProgress(promiseKey)) {
      return this.workspaces;
    }
    this.promises[promiseKey] = this.api
      .getWorkspaces()
      .then(data => {
        this.workspaces = data;
        this.handleDataAndCleanup(promiseKey, data);
      })
      .catch((error: ApiError) => {
        this.workspaces = null;
        this.handleErrorAndCleanup(promiseKey, error);
      });
    return this.workspaces;
  }

  /**
   * After a promise is completed handle the cleanup and trigger
   * listeners and callbacks appropriately.
   */
  protected handleDataAndCleanup(promiseKey: string, ...values: any) {
    delete this.promises[promiseKey];
    const callbacks = this.successCallbacks[promiseKey] ?? new Set();
    delete this.successCallbacks[promiseKey];
    for (const callback of callbacks) {
      callback(...values);
    }
    this.triggerListener(promiseKey, ...values);
    this.render();
  }

  /**
   * After a promise fails handle the cleanup and trigger
   * listeners and callbacks appropriately.
   */
  protected handleErrorAndCleanup(
    promiseKey: string,
    error: ApiError,
    options?: ErrorHandlingOptions
  ) {
    delete this.promises[promiseKey];
    const callbacks = this.errorCallbacks[promiseKey] ?? new Set();
    delete this.errorCallbacks[promiseKey];
    for (const callback of callbacks) {
      callback(error);
    }
    if (!options?.preventDefaultHandling) {
      catchError(error);
    } else if (!options?.preventNotification) {
      announceNotification(error);
    } else {
      readNotification(error);
    }
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
    this.delayCallbacks(promiseKey, callback, callbackError);
    this.api
      .loadWorkspace(workspace)
      .then((data: WorkspaceData) => {
        this.workspace = data;

        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();

        // Reload the files if loaded.
        if (this.files) {
          this.getFiles();
        }

        // Reload the open file after the workspace switch.
        if (this.file?.file) {
          this.getFile(this.file.file);
        }

        this.handleDataAndCleanup(promiseKey, data);
      })
      .catch((error: ApiError) =>
        this.handleErrorAndCleanup(promiseKey, error)
      );
  }

  /**
   * Lazy load of project data.
   *
   * Understands the null state when there is an error requesting.
   */
  previewConfigOrGetPreviewConfig(): PreviewSettings | undefined | null {
    if (
      this.previewConfig === undefined &&
      !this.inProgress(StatePromiseKeys.GetPreviewConfig)
    ) {
      this.getPreviewConfig();
    }
    return this.previewConfig;
  }

  protected processPendingFilePath() {
    if (!this.pendingFile) {
      return;
    }

    if (this.onboardingInfo?.status === OnboardingStatus.Valid) {
      this.getFile(this.pendingFile);
      this.pendingFile = undefined;
    }
  }

  /**
   * Lazy load of project data.
   *
   * Understands the null state when there is an error requesting.
   */
  projectOrGetProject(): ProjectData | undefined | null {
    if (
      this.project === undefined &&
      !this.inProgress(StatePromiseKeys.GetProject)
    ) {
      this.getProject();
    }
    return this.project;
  }

  get projectId(): string | undefined {
    const project = this.projectOrGetProject();
    if (project?.source?.source && project?.source?.identifier) {
      return `${project.source.source}/${project.source.identifier}`;
    }
    return undefined;
  }

  publish(
    workspace: WorkspaceData,
    data: Record<string, any>,
    callback?: (result: PublishResult) => void,
    callbackError?: (error: ApiError) => void
  ) {
    const promiseKey = StatePromiseKeys.Publish;
    this.delayCallbacks(promiseKey, callback, callbackError);
    this.api
      .publish(workspace, data)
      .then((result: PublishResult) => {
        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();

        this.handleDataAndCleanup(promiseKey, result);
      })
      .catch((error: ApiError) =>
        this.handleErrorAndCleanup(promiseKey, error)
      );
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
    this.delayCallbacks(promiseKey, callback, callbackError);
    if (this.inProgress(promiseKey)) {
      return;
    }

    this.promises[promiseKey] = this.api
      .saveFile(file, isRawEdit)
      .then(data => {
        this.file = data;

        // Reload the workspace from the api.
        // Refreshes the publish status.
        this.workspace = this.getWorkspace();

        this.handleDataAndCleanup(promiseKey, data);
        document.dispatchEvent(new CustomEvent(EVENT_FILE_LOAD_COMPLETE));
        document.dispatchEvent(new CustomEvent(EVENT_FILE_SAVE_COMPLETE));
      })
      .catch((error: ApiError) =>
        this.handleErrorAndCleanup(promiseKey, error)
      );
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

  protected updateTitle() {
    const parts = [];

    if (this.file?.file) {
      parts.push(this.file.file.path.split('/').pop());
    }

    if (this.project?.source?.label) {
      parts.push(this.project?.source?.label);
    } else if (this.project?.source?.source) {
      parts.push(this.project?.source?.source);
    }

    parts.push('Editor.dev');

    document.title = parts.join(' — ');
  }

  protected updateFilePreviewUrl(path: string) {
    const updateUrl = (previewSettings: PreviewSettings | null) => {
      if (previewSettings && path in previewSettings.routes) {
        const baseUrl = interpolatePreviewUrl(
          this.project?.preview as EditorPreviewSettings,
          this.workspace as WorkspaceData
        );
        const route = previewSettings.routes[path];

        if ((route as PreviewRoutesMetaData).path) {
          this.filePreviewUrl = `${baseUrl}${(
            route as PreviewRoutesMetaData
          ).path.replace(REGEX_START_SLASH, '')}`;
        } else {
          this.filePreviewUrl = `${baseUrl}${(route as PreviewRoutesLocaleData)[
            previewSettings.defaultLocale
          ].path.replace(REGEX_START_SLASH, '')}`;
        }

        this.render();
      } else {
        this.filePreviewUrl = null;
      }
    };

    if (this.previewConfig === undefined) {
      this.getPreviewConfig(updateUrl);
    } else {
      updateUrl(this.previewConfig);
    }
  }

  /**
   * Lazy load of workspace data.
   *
   * Understands the null state when there is an error requesting.
   */
  workspaceOrGetWorkspace(): WorkspaceData | undefined | null {
    if (
      this.workspace === undefined &&
      !this.inProgress(StatePromiseKeys.GetWorkspace)
    ) {
      this.getWorkspace();
    }
    return this.workspace;
  }

  /**
   * Lazy load of workspaces data.
   *
   * Understands the null state when there is an error requesting.
   */
  workspacesOrGetWorkspaces(): Array<WorkspaceData> | undefined | null {
    if (
      this.workspaces === undefined &&
      !this.inProgress(StatePromiseKeys.GetWorkspaces)
    ) {
      this.getWorkspaces();
    }
    return this.workspaces;
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
    height: 900,
    isDefault: true,
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
  CheckOnboarding = 'CheckOnboarding',
  CopyFile = 'CopyFile',
  CreateFile = 'CreateFile',
  CreateWorkspace = 'CreateWorkspace',
  DeleteFile = 'DeleteFile',
  GetAuthentication = 'GetAuthentication',
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

export interface ErrorHandlingOptions {
  /**
   * When true, prevents opening the full notification window with
   * error details.
   */
  preventDefaultHandling?: boolean;
  /**
   * When true, prevents showing a notification for the error.
   */
  preventNotification?: boolean;
}
