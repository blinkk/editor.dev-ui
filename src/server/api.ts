import {
  DeviceData,
  EditorFileData,
  EmptyData,
  FileData,
  LiveEditorApiComponent,
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
  get baseUrl() {
    return `https://api.${window.location.hostname}/`;
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
      this.resolveUrl('/file.copy'),
      this.expandParams({
        originalPath: originalPath,
        path: path,
      })
    ) as Promise<FileData>;
  }

  async createFile(path: string): Promise<FileData> {
    return postJSON(
      this.resolveUrl('/file.create'),
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
      this.resolveUrl('/workspace.create'),
      this.expandParams({
        base: base,
        workspace: workspace,
      })
    ) as Promise<WorkspaceData>;
  }

  async deleteFile(file: FileData): Promise<EmptyData> {
    return postJSON(
      this.resolveUrl('/file.delete'),
      this.expandParams({
        file: file,
      })
    ) as Promise<EmptyData>;
  }

  async getDevices(): Promise<Array<DeviceData>> {
    return postJSON(
      this.resolveUrl('/devices.get'),
      this.expandParams({})
    ) as Promise<Array<DeviceData>>;
  }

  async getFile(file: FileData): Promise<EditorFileData> {
    return postJSON(
      this.resolveUrl('/file.get'),
      this.expandParams({
        file: file,
      })
    ) as Promise<EditorFileData>;
  }

  async getFiles(): Promise<Array<FileData>> {
    return postJSON(
      this.resolveUrl('/files.get'),
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
      this.resolveUrl('/project.get'),
      this.expandParams({})
    ) as Promise<ProjectData>;
  }

  async getWorkspace(): Promise<WorkspaceData> {
    return postJSON(
      this.resolveUrl('/workspace.get'),
      this.expandParams({})
    ) as Promise<WorkspaceData>;
  }

  async getWorkspaces(): Promise<Array<WorkspaceData>> {
    return postJSON(
      this.resolveUrl('/workspaces.get'),
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
      this.resolveUrl('/publish.start'),
      this.expandParams({
        workspace: workspace,
        data: data,
      })
    ) as Promise<PublishResult>;
  }

  resolveUrl(path: string) {
    // Strip off the preceding /.
    path = path.replace(/\/*/, '');
    return `${this.baseUrl}${path}`;
  }

  async saveFile(file: EditorFileData): Promise<EditorFileData> {
    return postJSON(
      this.resolveUrl('/file.save'),
      this.expandParams({
        file: file,
      })
    ) as Promise<EditorFileData>;
  }

  async uploadFile(file: File, meta?: Record<string, any>): Promise<FileData> {
    return postJSON(
      this.resolveUrl('/file.upload'),
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

  get baseUrl() {
    return `http://localhost:${this.port}/`;
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

  get baseUrl() {
    let domain = 'https://api.editor.dev';
    if (this.isDev) {
      domain = 'http://localhost:9090';
    } else if (this.isUnstable) {
      domain = 'https://api.beta.editor.dev';
    }
    const path = `/${this.service}/${this.organization}/${this.project}/${this.branch}/`;
    return `${domain}${path}`;
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
