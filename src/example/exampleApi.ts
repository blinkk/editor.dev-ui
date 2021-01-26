import {
  ApiError,
  DeviceData,
  EditorFileData,
  FileData,
  LiveEditorApiComponent,
  ProjectData,
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
    author: {
      name: 'Example User',
      email: 'example@example.com',
    },
    commit: '951c206e5f10ba99d13259293b349e321e4a6a9e',
    commitSummary: 'Example commit summary.',
  },
  name: 'main',
};

const currentWorkspaces: Array<WorkspaceData> = [
  currentWorkspace,
  {
    branch: {
      name: 'staging',
      author: {
        name: 'Example User',
        email: 'example@example.com',
      },
      commit: '26506fd82b7d5d6aab6b3a92c7ef641c7073b249',
      commitSummary: 'Example commit summary.',
    },
    name: 'staging',
  },
  {
    branch: {
      name: 'workspace/redesign',
      author: {
        name: 'Example User',
        email: 'example@example.com',
      },
      commit: 'db29a258dacdd416bb24bb63c689d669df08d409',
      commitSummary: 'Example commit summary.',
    },
    name: 'redesign',
  },
];

/**
 * Example api that returns data through a 'simulated' network.
 */
export class ExampleApi implements LiveEditorApiComponent {
  respondWithErrors: boolean;

  constructor() {
    this.respondWithErrors = false;
  }

  async copyFile(originalPath: string, path: string): Promise<FileData> {
    return new Promise<FileData>((resolve, reject) => {
      console.log('API: copyFile', originalPath, path);

      if (this.respondWithErrors) {
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
      console.log('API: createFile', path);

      if (this.respondWithErrors) {
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
      console.log('API: createWorkspace', base, workspace);

      if (this.respondWithErrors) {
        reject({
          message: 'Failed to create the workspace.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      const newWorkspace: WorkspaceData = {
        branch: {
          name: `workspace/${workspace}`,
          commit: base.branch.commit,
          commitSummary: base.branch.commitSummary,
          author: base.branch.author,
        },
        name: workspace,
      };
      currentWorkspaces.push(newWorkspace);
      simulateNetwork(resolve, newWorkspace);
    });
  }

  async deleteFile(file: FileData): Promise<null> {
    return new Promise<null>((resolve, reject) => {
      console.log('API: deleteFile', file.path);

      if (this.respondWithErrors) {
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
      console.log('API: getDevices');

      if (this.respondWithErrors) {
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

  async getFiles(): Promise<Array<FileData>> {
    return new Promise<Array<FileData>>((resolve, reject) => {
      console.log('API: getFiles');

      if (this.respondWithErrors) {
        reject({
          message: 'Failed to get the files.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      simulateNetwork(resolve, [...currentFileset]);
    });
  }

  async getProject(): Promise<ProjectData> {
    return new Promise<ProjectData>((resolve, reject) => {
      console.log('API: getProject');

      if (this.respondWithErrors) {
        reject({
          message: 'Failed to get the project.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      simulateNetwork(resolve, {
        title: 'Example project',
      });
    });
  }

  async getUsers(): Promise<Array<UserData>> {
    return new Promise<Array<UserData>>((resolve, reject) => {
      console.log('API: getUsers');

      if (this.respondWithErrors) {
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
      console.log('API: getWorkspace');

      if (this.respondWithErrors) {
        reject({
          message: 'Failed to get the workspace.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      simulateNetwork(resolve, currentWorkspace);
    });
  }

  async getWorkspaces(): Promise<Array<WorkspaceData>> {
    return new Promise<Array<WorkspaceData>>((resolve, reject) => {
      console.log('API: getWorkspaces');

      if (this.respondWithErrors) {
        reject({
          message: 'Failed to get the workspaces.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      simulateNetwork(resolve, [...currentWorkspaces]);
    });
  }

  async loadFile(file: FileData): Promise<EditorFileData> {
    return new Promise<EditorFileData>((resolve, reject) => {
      console.log('API: loadFile', file);

      if (this.respondWithErrors) {
        reject({
          message: 'Failed to load the file.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      // TODO: Make the fields for each file dynamic for the example.
      simulateNetwork(resolve, {
        file: file,
        editor: {
          fields: [
            {
              type: 'text',
              label: 'Title',
            } as FieldConfig,
          ],
        },
      } as EditorFileData);
    });
  }

  async loadWorkspace(workspace: WorkspaceData): Promise<WorkspaceData> {
    return new Promise<WorkspaceData>((resolve, reject) => {
      console.log('API: loadWorkspace');

      if (this.respondWithErrors) {
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
}
