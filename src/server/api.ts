import {
  DeviceData,
  EditorFileData,
  EmptyData,
  FileData,
  LiveEditorApiComponent,
  PingResult,
  ProjectData,
  PublishResult,
  WorkspaceData,
} from '../editor/api';
import bent from 'bent';

const postJSON = bent('json', 'POST');

/**
 * Example api that returns data through a 'simulated' network.
 */
export class ServerApi implements LiveEditorApiComponent {
  get apiBaseUrl() {
    return `https://api.${window.location.hostname}/`;
  }

  get baseUrl() {
    return '/';
  }

  /**
   * Verify that the authentication for services that require auth.
   *
   * @returns True if the auth check out.
   */
  checkAuth(): boolean {
    return true;
  }

  /**
   * Specific services may need to add additional params to all of
   * the api request (such as authentication params.)
   *
   * @param params Params being sent to the api.
   * @returns Updated params to send to the api.
   */
  expandParams(params: Record<string, any>): Record<string, any> {
    return params;
  }

  async copyFile(originalPath: string, path: string): Promise<FileData> {
    return postJSON(
      this.resolveApiUrl('/file.copy'),
      this.expandParams({
        originalPath: originalPath,
        path: path,
      })
    ) as Promise<FileData>;
  }

  async createFile(path: string): Promise<FileData> {
    return postJSON(
      this.resolveApiUrl('/file.create'),
      this.expandParams({
        path: path,
      })
    ) as Promise<FileData>;
  }

  async createWorkspace(
    base: WorkspaceData,
    workspace: string
  ): Promise<WorkspaceData> {
    return postJSON(
      this.resolveApiUrl('/workspace.create'),
      this.expandParams({
        base: base,
        workspace: workspace,
      })
    ) as Promise<WorkspaceData>;
  }

  async deleteFile(file: FileData): Promise<EmptyData> {
    return postJSON(
      this.resolveApiUrl('/file.delete'),
      this.expandParams({
        file: file,
      })
    ) as Promise<EmptyData>;
  }

  async getDevices(): Promise<Array<DeviceData>> {
    return postJSON(
      this.resolveApiUrl('/devices.get'),
      this.expandParams({})
    ) as Promise<Array<DeviceData>>;
  }

  async getFile(file: FileData): Promise<EditorFileData> {
    window.history.pushState({}, '', this.resolveUrl(file.path));

    return postJSON(
      this.resolveApiUrl('/file.get'),
      this.expandParams({
        file: file,
      })
    ) as Promise<EditorFileData>;
  }

  async getFiles(): Promise<Array<FileData>> {
    return postJSON(
      this.resolveApiUrl('/files.get'),
      this.expandParams({})
    ) as Promise<Array<FileData>>;
  }

  async getFileUrl(file: FileData): Promise<FileData> {
    // TODO: Use preview server to determine urls for files.
    return Promise.resolve({
      path: file.path,
      url: 'image-landscape.png',
    } as FileData);
  }

  async getProject(): Promise<ProjectData> {
    return postJSON(
      this.resolveApiUrl('/project.get'),
      this.expandParams({})
    ) as Promise<ProjectData>;
  }

  async getWorkspace(): Promise<WorkspaceData> {
    return postJSON(
      this.resolveApiUrl('/workspace.get'),
      this.expandParams({})
    ) as Promise<WorkspaceData>;
  }

  async getWorkspaces(): Promise<Array<WorkspaceData>> {
    return postJSON(
      this.resolveApiUrl('/workspaces.get'),
      this.expandParams({})
    ) as Promise<Array<WorkspaceData>>;
  }

  async loadWorkspace(workspace: WorkspaceData): Promise<WorkspaceData> {
    return Promise.resolve(workspace);
  }

  async publish(
    workspace: WorkspaceData,
    data?: Record<string, any>
  ): Promise<PublishResult> {
    return postJSON(
      this.resolveApiUrl('/publish.start'),
      this.expandParams({
        workspace: workspace,
        data: data,
      })
    ) as Promise<PublishResult>;
  }

  resolveApiUrl(path: string) {
    // Strip off the preceding /.
    path = path.replace(/\/*/, '');
    return `${this.apiBaseUrl}${path}`;
  }

  resolveUrl(path: string) {
    // Strip off the preceding /.
    path = path.replace(/\/*/, '');
    return `${this.baseUrl}${path}`;
  }

  async saveFile(
    file: EditorFileData,
    isRawEdit: boolean
  ): Promise<EditorFileData> {
    return postJSON(
      this.resolveApiUrl('/file.save'),
      this.expandParams({
        file: file,
        isRawEdit: isRawEdit,
      })
    ) as Promise<EditorFileData>;
  }

  async uploadFile(file: File, meta?: Record<string, any>): Promise<FileData> {
    return postJSON(
      this.resolveApiUrl('/file.upload'),
      this.expandParams({
        file: file,
        meta: meta,
      })
    ) as Promise<FileData>;
  }
}

/**
 * Connects to a locally running version of the api.
 *
 * This is used when a user is running `npx @blinkk/editor-server` locally.
 */
export class LocalServerApi extends ServerApi {
  port: number;

  constructor(port: number) {
    super();
    this.port = port;
  }

  get apiBaseUrl() {
    return `http://localhost:${this.port}/`;
  }

  get baseUrl() {
    return `/local/${this.port}/`;
  }

  async ping() {
    return postJSON(
      this.resolveApiUrl('/ping'),
      this.expandParams({})
    ) as Promise<PingResult>;
  }
}

/**
 * Connects to the corresponding api server and maps to the right service
 * api for the request urls.
 */
export class ServiceServerApi extends ServerApi {
  branch: string;
  isDev: boolean;
  isUnstable: boolean;
  organization: string;
  project: string;
  service: string;

  constructor(
    service: string,
    organization: string,
    project: string,
    branch?: string,
    isUnstable?: boolean,
    isDev?: boolean
  ) {
    super();
    this.service = service;
    this.organization = organization;
    this.project = project;
    this.branch = branch || 'main';
    this.isUnstable = isUnstable || false;
    this.isDev = isDev || false;
  }

  get apiBaseUrl() {
    let domain = 'https://api.editor.dev';
    if (this.isDev) {
      domain = 'http://localhost:9090';
    } else if (this.isUnstable) {
      domain = 'https://api.beta.editor.dev';
    }
    const path = `/${this.service}/${this.organization}/${this.project}/${this.branch}/`;
    return `${domain}${path}`;
  }

  get baseUrl() {
    return `/${this.service}/${this.organization}/${this.project}/${this.branch}/`;
  }

  async loadWorkspace(workspace: WorkspaceData): Promise<WorkspaceData> {
    // Update the url to use the new branch.
    this.branch = workspace.name;
    window.history.pushState(
      {},
      '',
      `/${this.service}/${this.organization}/${this.project}/${this.branch}/`
    );
    return Promise.resolve(workspace);
  }
}
