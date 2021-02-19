import {
  ApiError,
  DeviceData,
  EditorFileData,
  FileData,
  LiveEditorApiComponent,
  ProjectData,
  ProjectPublishConfig,
  PublishResult,
  PublishStatus,
  SiteData,
  UrlLevel,
  UserData,
  WorkspaceData,
} from '../editor/api';
import {FieldConfig} from '@blinkk/selective-edit/dist/src/selective/field';

const MAX_RESPONSE_MS = 1200;
const MIN_RESPONSE_MS = 250;

/**
 * Simulate having the request be slowed down by a network.
 *
 * @param callback Callback after 'network' lag complete.
 * @param response Response for the callback.
 */
function simulateNetwork(callback: Function, response: any) {
  setTimeout(() => {
    callback(response);
  }, Math.random() * (MAX_RESPONSE_MS - MIN_RESPONSE_MS) + MIN_RESPONSE_MS);
}

const DEFAULT_EDITOR_FILE: EditorFileData = {
  data: {
    title: 'Testing',
  },
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
      } as FieldConfig,
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
  url: 'preview.html',
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
    path: '/content/pages/about.yaml',
  },
  {
    path: '/content/pages/sub/page.yaml',
  },
  {
    path: '/content/pages/sub/another.yaml',
  },
  {
    path: '/content/strings/about.yaml',
  },
  {
    path: '/example/basic.yaml',
  },
  {
    path: '/static/img/portrait.png',
    url: 'image-portrait.png',
  },
];

const fullFiles: Record<string, EditorFileData> = {
  '/example/basic.yaml': {
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
        } as FieldConfig,
        {
          type: 'exampleAside',
          key: 'help.text',
          source: formatCodeSample(`
            type: text
            key: title
            label: Title
            validation:
            - type: require
              message: Title is required.`),
        } as FieldConfig,
        {
          type: 'textarea',
          key: 'description',
          label: 'Description',
        } as FieldConfig,
        {
          type: 'exampleAside',
          key: 'help.textarea',
          source: formatCodeSample(`
            type: textarea
            key: description
            label: Description`),
        } as FieldConfig,
      ],
    },
    file: {
      path: '/example/basic.yaml',
    },
    url: 'preview.html',
  },
};

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
export class ExampleApi implements LiveEditorApiComponent {
  errorController: ErrorController;
  workflow: WorkspaceWorkflow;

  constructor() {
    this.errorController = new ErrorController();
    this.workflow = WorkspaceWorkflow.Success;
  }

  async copyFile(originalPath: string, path: string): Promise<FileData> {
    return new Promise<FileData>((resolve, reject) => {
      const methodName = 'copyFile';
      console.log(`API: ${methodName}`, originalPath, path);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to copy the file.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      const newFile: FileData = {
        path: path,
      };
      currentFileset.push(newFile);
      simulateNetwork(resolve, newFile);
    });
  }

  async createFile(path: string): Promise<FileData> {
    return new Promise<FileData>((resolve, reject) => {
      const methodName = 'createFile';
      console.log(`API: ${methodName}`, path);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to create the file.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      const newFile: FileData = {
        path: path,
      };
      currentFileset.push(newFile);
      simulateNetwork(resolve, newFile);
    });
  }

  async createWorkspace(
    base: WorkspaceData,
    workspace: string
  ): Promise<WorkspaceData> {
    return new Promise<WorkspaceData>((resolve, reject) => {
      const methodName = 'createWorkspace';
      console.log(`API: ${methodName}`, base, workspace);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to create the workspace.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      const newWorkspace: WorkspaceData = {
        branch: {
          name: `workspace/${workspace}`,
          commit: {
            author: base.branch.commit.author,
            hash: base.branch.commit.hash,
            message: base.branch.commit.message,
            summary: base.branch.commit.summary,
            timestamp: new Date().toISOString(),
          },
        },
        name: workspace,
      };
      currentWorkspaces.push(newWorkspace);
      simulateNetwork(resolve, newWorkspace);
    });
  }

  async deleteFile(file: FileData): Promise<null> {
    return new Promise<null>((resolve, reject) => {
      const methodName = 'deleteFile';
      console.log(`API: ${methodName}`, file.path);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to delete the file.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      for (let i = 0; i < currentFileset.length; i++) {
        if (currentFileset[i].path === file.path) {
          currentFileset.splice(i, 1);
          break;
        }
      }

      simulateNetwork(resolve, null);
    });
  }

  async getDevices(): Promise<Array<DeviceData>> {
    return new Promise<Array<DeviceData>>((resolve, reject) => {
      const methodName = 'getDevices';
      console.log(`API: ${methodName}`);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to get the devices.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      simulateNetwork(resolve, [
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
      const methodName = 'loadFile';
      console.log(`API: ${methodName}`, file);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to load the file.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      simulateNetwork(resolve, fullFiles[file.path] || DEFAULT_EDITOR_FILE);
    });
  }

  async getFiles(): Promise<Array<FileData>> {
    return new Promise<Array<FileData>>((resolve, reject) => {
      const methodName = 'getFiles';
      console.log(`API: ${methodName}`);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to get the files.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      simulateNetwork(resolve, [...currentFileset]);
    });
  }

  async getFileUrl(file: FileData): Promise<FileData> {
    return new Promise<FileData>((resolve, reject) => {
      const methodName = 'getFileUrl';
      console.log(`API: ${methodName}`, file.path);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to get the file url.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      // TODO: Use some logic to determine what url to return.
      simulateNetwork(resolve, {
        path: file.path,
        url: 'image-landscape.png',
      } as FileData);
    });
  }

  async getProject(): Promise<ProjectData> {
    return new Promise<ProjectData>((resolve, reject) => {
      const methodName = 'getProject';
      console.log(`API: ${methodName}`);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to get the project.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      let publish: ProjectPublishConfig | undefined = undefined;
      if (
        [
          WorkspaceWorkflow.Success,
          WorkspaceWorkflow.Pending,
          WorkspaceWorkflow.Failure,
        ].includes(this.workflow)
      ) {
        publish = {
          fields: [
            {
              type: 'text',
              key: 'message',
              label: 'Publish message',
              validation: [
                {
                  type: 'require',
                  message: 'Message for publishing is required.',
                },
              ],
            } as FieldConfig,
          ],
        };
      } else if (this.workflow !== WorkspaceWorkflow.NoPublish) {
        publish = {};
      }

      simulateNetwork(resolve, {
        title: 'Example project',
        publish: publish,
      });
    });
  }

  async getSite(): Promise<SiteData> {
    return new Promise<SiteData>((resolve, reject) => {
      const methodName = 'getSite';
      console.log(`API: ${methodName}`);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to get the site.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      simulateNetwork(resolve, {});
    });
  }

  async getUsers(): Promise<Array<UserData>> {
    return new Promise<Array<UserData>>((resolve, reject) => {
      const methodName = 'getUsers';
      console.log(`API: ${methodName}`);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to get the users.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      simulateNetwork(resolve, [...currentUsers]);
    });
  }

  async getWorkspace(): Promise<WorkspaceData> {
    return new Promise<WorkspaceData>((resolve, reject) => {
      const methodName = 'getWorkspace';
      console.log(`API: ${methodName}`);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to get the workspace.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      if ([WorkspaceWorkflow.Pending].includes(this.workflow)) {
        if (!currentWorkspace.publish) {
          currentWorkspace.publish = {
            status: PublishStatus.Pending,
          };
        } else {
          currentWorkspace.publish.status = PublishStatus.Pending;
        }
      }

      if ([WorkspaceWorkflow.NoChanges].includes(this.workflow)) {
        if (!currentWorkspace.publish) {
          currentWorkspace.publish = {
            status: PublishStatus.NoChanges,
          };
        } else {
          currentWorkspace.publish.status = PublishStatus.NoChanges;
        }
      }

      if ([WorkspaceWorkflow.Failure].includes(this.workflow)) {
        if (!currentWorkspace.publish) {
          currentWorkspace.publish = {
            status: PublishStatus.Failure,
          };
        } else {
          currentWorkspace.publish.status = PublishStatus.Failure;
        }
      }

      simulateNetwork(resolve, currentWorkspace);
    });
  }

  async getWorkspaces(): Promise<Array<WorkspaceData>> {
    return new Promise<Array<WorkspaceData>>((resolve, reject) => {
      const methodName = 'getWorkspaces';
      console.log(`API: ${methodName}`);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to get the workspaces.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      simulateNetwork(resolve, [...currentWorkspaces]);
    });
  }

  async loadWorkspace(workspace: WorkspaceData): Promise<WorkspaceData> {
    return new Promise<WorkspaceData>((resolve, reject) => {
      const methodName = 'loadWorkspace';
      console.log(`API: ${methodName}`, workspace.name);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to load the workspaces.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      currentWorkspace = workspace;

      simulateNetwork(resolve, currentWorkspace);
    });
  }

  async publish(
    workspace: WorkspaceData,
    data?: Record<string, any>
  ): Promise<PublishResult> {
    return new Promise<PublishResult>((resolve, reject) => {
      const methodName = 'publish';
      console.log(`API: ${methodName}`, workspace.name, data);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to publish.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      let status: PublishStatus = PublishStatus.Complete;
      if ([WorkspaceWorkflow.Failure].includes(this.workflow)) {
        status = PublishStatus.Failure;
      } else if ([WorkspaceWorkflow.Pending].includes(this.workflow)) {
        status = PublishStatus.Pending;
      }

      let responseWorkspace = currentWorkspace;

      // If the workflow changes the workspace, use a different workspace than
      // the current workspace in the response.
      if (this.workflow === WorkspaceWorkflow.SuccessChangeWorkspace) {
        for (const workspace of currentWorkspaces) {
          if (currentWorkspace !== workspace) {
            responseWorkspace = workspace;
            break;
          }
        }
      }

      simulateNetwork(resolve, {
        status: status,
        workspace: responseWorkspace,
      });
    });
  }

  async uploadFile(file: File, meta?: Record<string, any>): Promise<FileData> {
    return new Promise<FileData>((resolve, reject) => {
      const methodName = 'uploadFile';
      console.log(`API: ${methodName}`, file, meta);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to upload file.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      simulateNetwork(resolve, {
        path: '/static/img/portrait.png',
        url: 'image-portrait.png',
      } as FileData);
    });
  }
}

export class ErrorController {
  errorMethods: Set<string>;

  constructor() {
    this.errorMethods = new Set();
  }

  makeError(methodName: string) {
    return this.errorMethods.add(methodName);
  }

  makeSuccess(methodName: string) {
    return this.errorMethods.delete(methodName);
  }

  shouldError(methodName: string) {
    return this.errorMethods.has(methodName);
  }

  toggleError(methodName: string) {
    if (this.errorMethods.has(methodName)) {
      this.errorMethods.delete(methodName);
    } else {
      this.errorMethods.add(methodName);
    }
  }
}

export enum WorkspaceWorkflow {
  Failure = 'failure',
  NoChanges = 'noChanges',
  NoPublish = 'noPublish',
  Pending = 'pending',
  Success = 'success',
  SuccessNoFields = 'successNoFields',
  SuccessChangeWorkspace = 'successChangeWorkspace',
}

function formatCodeSample(code: string, type = 'yaml'): string {
  const cleanLines: Array<string> = [];
  let indentLength = -1;
  for (const line of code.split('\n')) {
    if (!line.trim()) {
      continue;
    }

    if (indentLength < 0) {
      indentLength = line.length - line.trim().length;
    }

    // Remove the same indent length off all lines based on first line.
    cleanLines.push(line.slice(indentLength));
  }

  return `\`\`\`${type || ''}\n${cleanLines.join('\n')}\n\`\`\``;
}
