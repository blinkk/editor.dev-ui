import {LiveEditorApiComponent, ProjectData, WorkspaceData} from './editor/api';

/**
 * Simulate having the request be slowed down by a network.
 *
 * @param callback Callback after 'network' lag complete.
 * @param response Response for the callback.
 */
function simulateNetwork(callback: Function, response: any) {
  const min = 250;
  const max = 1200;
  setTimeout(() => {
    callback(response);
  }, Math.random() * (max - min) + min);
}

/**
 * Example api that returns data through a 'simulated' network.
 */
export class ExampleApi implements LiveEditorApiComponent {
  getProject(): Promise<ProjectData> {
    return new Promise<ProjectData>(resolve => {
      simulateNetwork(resolve, {
        title: 'Example project',
      });
    });
  }

  getWorkspace(): Promise<WorkspaceData> {
    return new Promise<WorkspaceData>(resolve => {
      simulateNetwork(resolve, {
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
      });
    });
  }

  getWorkspaces(): Promise<Array<WorkspaceData>> {
    return new Promise<Array<WorkspaceData>>(resolve => {
      simulateNetwork(resolve, [
        {
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
        },
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
      ]);
    });
  }
}
