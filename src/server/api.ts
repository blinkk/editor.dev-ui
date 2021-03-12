import {
  DeviceData,
  EditorFileData,
  FileData,
  LiveEditorApiComponent,
  ProjectData,
  PublishResult,
  PublishStatus,
  SiteData,
  UrlLevel,
  UserData,
  WorkspaceData,
} from '../editor/api';
import {TextFieldConfig} from '@blinkk/selective-edit';
import bent from 'bent';

const deleteJSON = bent('json', 'DELETE');
const getJSON = bent('json');
const postJSON = bent('json', 'POST');
const putJSON = bent('json', 'PUT');

const DEFAULT_EDITOR_FILE: EditorFileData = {
  content: 'Example content.',
  data: {
    title: 'Testing',
  },
  dataRaw: 'title: Testing',
  file: {
    path: '/content/pages/index.yaml',
  },
  editor: {
    fields: [
      {
        type: 'text',
        key: 'title',
        label: 'Title',
        validation: [
          {
            type: 'require',
            message: 'Title is required.',
          },
        ],
      } as TextFieldConfig,
    ],
  },
  history: [
    {
      author: {
        name: 'Example User',
        email: 'example@example.com',
      },
      hash: 'db29a258dacdd416bb24bb63c689d669df08d409',
      summary: 'Example commit summary.',
      timestamp: new Date(
        new Date().getTime() - 1 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      author: {
        name: 'Example User',
        email: 'example@example.com',
      },
      hash: 'f36d7c0d556e30421a7a8f22038234a9174f0e04',
      summary: 'Example commit summary.',
      timestamp: new Date(
        new Date().getTime() - 2 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      author: {
        name: 'Example User',
        email: 'example@example.com',
      },
      hash: '6dda2682901bf4f2f03f936267169454120f1806',
      summary:
        'Example commit summary. With a long summary. Like really too long for a summary. Probably should use a shorter summary.',
      timestamp: new Date(
        new Date().getTime() - 4 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      author: {
        name: 'Example User',
        email: 'example@example.com',
      },
      hash: '465e3720c050f045d9500bd9bc7c7920f192db78',
      summary: 'Example commit summary.',
      timestamp: new Date(
        new Date().getTime() - 14 * 60 * 60 * 1000
      ).toISOString(),
    },
  ],
  url: '/preview.html',
  urls: [
    {
      url: '#private',
      label: 'Live editor preview',
      level: UrlLevel.PRIVATE,
    },
    {
      url: '#protected',
      label: 'Staging',
      level: UrlLevel.PROTECTED,
    },
    {
      url: '#public',
      label: 'Live',
      level: UrlLevel.PUBLIC,
    },
    {
      url: 'https://github.com/blinkkcode/live-edit/',
      label: 'View in Github',
      level: UrlLevel.SOURCE,
    },
  ],
};

const currentFileset: Array<FileData> = [
  {
    path: '/content/pages/index.yaml',
  },
  {
    path: '/static/img/portrait.png',
    url: 'image-portrait.png',
  },
];

const currentUsers: Array<UserData> = [
  {
    name: 'Example User',
    email: 'example@example.com',
  },
  {
    name: 'Domain users',
    email: '@domain.com',
    isGroup: true,
  },
];

let currentWorkspace: WorkspaceData = {
  branch: {
    name: 'main',
    commit: {
      author: {
        name: 'Example User',
        email: 'example@example.com',
      },
      hash: '951c206e5f10ba99d13259293b349e321e4a6a9e',
      summary: 'Example commit summary.',
      timestamp: new Date().toISOString(),
    },
  },
  name: 'main',
};

const currentWorkspaces: Array<WorkspaceData> = [
  currentWorkspace,
  {
    branch: {
      name: 'staging',
      commit: {
        author: {
          name: 'Example User',
          email: 'example@example.com',
        },
        hash: '26506fd82b7d5d6aab6b3a92c7ef641c7073b249',
        summary: 'Example commit summary.',
        timestamp: new Date(
          new Date().getTime() - 2 * 60 * 60 * 1000
        ).toISOString(),
      },
    },
    name: 'staging',
  },
  {
    branch: {
      name: 'workspace/redesign',
      commit: {
        author: {
          name: 'Example User',
          email: 'example@example.com',
        },
        hash: 'db29a258dacdd416bb24bb63c689d669df08d409',
        summary: 'Example commit summary.',
        timestamp: new Date(
          new Date().getTime() - 6 * 60 * 60 * 1000
        ).toISOString(),
      },
    },
    name: 'redesign',
  },
];

/**
 * Example api that returns data through a 'simulated' network.
 */
export class ServerApi implements LiveEditorApiComponent {
  get baseUrl() {
    return '/';
  }

  async copyFile(originalPath: string, path: string): Promise<FileData> {
    return postJSON(this.resolveUrl('/file/copy'), {
      originalPath: originalPath,
      path: path,
    }) as Promise<FileData>;
  }

  async createFile(path: string): Promise<FileData> {
    return putJSON(this.resolveUrl('/file'), {
      path: path,
    }) as Promise<FileData>;
  }

  async createWorkspace(
    base: WorkspaceData,
    workspace: string
  ): Promise<WorkspaceData> {
    return putJSON(this.resolveUrl('/workspace'), {
      base: base,
      workspace: workspace,
    }) as Promise<WorkspaceData>;
  }

  async deleteFile(file: FileData): Promise<null> {
    return deleteJSON(this.resolveUrl('/file'), {
      file: file,
    }) as Promise<null>;
  }

  async getDevices(): Promise<Array<DeviceData>> {
    return new Promise<Array<DeviceData>>((resolve, reject) => {
      resolve([
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
        {
          label: 'Desktop (Large)',
          width: 2200,
        } as DeviceData,
      ]);
    });
  }

  async getFile(file: FileData): Promise<EditorFileData> {
    return new Promise<EditorFileData>((resolve, reject) => {
      const url = new URL(window.location.toString());
      url.searchParams.set('path', file.path);
      window.history.pushState({}, '', url.toString());

      resolve(DEFAULT_EDITOR_FILE);
    });
  }

  async getFiles(): Promise<Array<FileData>> {
    return new Promise<Array<FileData>>((resolve, reject) => {
      resolve([...currentFileset]);
    });
  }

  async getFileUrl(file: FileData): Promise<FileData> {
    return new Promise<FileData>((resolve, reject) => {
      // TODO: Use some logic to determine what url to return.
      resolve({
        path: file.path,
        url: 'image-landscape.png',
      } as FileData);
    });
  }

  async getProject(): Promise<ProjectData> {
    return getJSON(this.resolveUrl('/project')) as Promise<ProjectData>;
  }

  async getSite(): Promise<SiteData> {
    return new Promise<SiteData>((resolve, reject) => {
      resolve({});
    });
  }

  async getUsers(): Promise<Array<UserData>> {
    return new Promise<Array<UserData>>((resolve, reject) => {
      resolve([...currentUsers]);
    });
  }

  async getWorkspace(): Promise<WorkspaceData> {
    return new Promise<WorkspaceData>((resolve, reject) => {
      resolve(currentWorkspace);
    });
  }

  async getWorkspaces(): Promise<Array<WorkspaceData>> {
    return new Promise<Array<WorkspaceData>>((resolve, reject) => {
      resolve([...currentWorkspaces]);
    });
  }

  async loadWorkspace(workspace: WorkspaceData): Promise<WorkspaceData> {
    return new Promise<WorkspaceData>((resolve, reject) => {
      currentWorkspace = workspace;
      resolve(currentWorkspace);
    });
  }

  async publish(
    workspace: WorkspaceData,
    data?: Record<string, any>
  ): Promise<PublishResult> {
    return new Promise<PublishResult>((resolve, reject) => {
      const status: PublishStatus = PublishStatus.Complete;

      resolve({
        status: status,
        workspace: currentWorkspace,
      });
    });
  }

  resolveUrl(path: string) {
    // Strip off the preceding /.
    path = path.replace(/\/*/, '');
    return `${this.baseUrl}${path}`;
  }

  async saveFile(file: EditorFileData): Promise<EditorFileData> {
    return new Promise<EditorFileData>((resolve, reject) => {
      resolve(DEFAULT_EDITOR_FILE);
    });
  }

  async uploadFile(file: File, meta?: Record<string, any>): Promise<FileData> {
    return new Promise<FileData>((resolve, reject) => {
      resolve({
        path: '/static/img/portrait.png',
        url: 'image-portrait.png',
      } as FileData);
    });
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
  isUnstable: boolean;
  organization: string;
  project: string;
  service: string;

  constructor(
    service: string,
    organization: string,
    project: string,
    branch?: string
  ) {
    super();
    this.service = service;
    this.organization = organization;
    this.project = project;
    this.branch = branch || 'main';
    this.isUnstable = true;
  }

  get baseUrl() {
    const domain = `https://api.${this.isUnstable ? 'beta.' : ''}editor.dev`;
    const path = `/${this.service}/${this.organization}/${this.project}/${this.branch}/`;
    return `${domain}${path}`;
  }
}

/**
 * Used for developing the service api locally when in development mode.
 */
export class DevServiceServerApi extends ServiceServerApi {
  get baseUrl() {
    const domain = 'http://localhost:9090';
    const path = `/${this.service}/${this.organization}/${this.project}/${this.branch}/`;
    return `${domain}${path}`;
  }
}
