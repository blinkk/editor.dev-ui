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
import {
  CheckboxFieldConfig,
  CheckboxMultiFieldConfig,
  ColorFieldConfig,
  DateFieldConfig,
  DatetimeFieldConfig,
  GroupFieldConfig,
  LengthRuleConfig,
  ListFieldConfig,
  NumberFieldConfig,
  RadioFieldConfig,
  TextAreaFieldConfig,
  TextFieldConfig,
  TimeFieldConfig,
  VariantFieldConfig,
} from '@blinkk/selective-edit';
import {AsideFieldConfig} from '../editor/field/aside';
import {ExampleFieldConfig} from './field/exampleField';
import {MediaFieldConfig} from '../editor/field/media';

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
    path: '/example/list.yaml',
  },
  {
    path: '/example/media.yaml',
  },
  {
    path: '/example/mediaList.yaml',
  },
  {
    path: '/example/standard.yaml',
  },
  {
    path: '/example/structure.yaml',
  },
  {
    path: '/example/utility.yaml',
  },
  {
    path: '/static/img/portrait.png',
    url: 'image-portrait.png',
  },
];

const fullFiles: Record<string, EditorFileData> = {
  '/example/list.yaml': {
    data: {
      listSimple: ['values', 'in', 'a', 'list'],
      listSimpleMedia: [
        {
          url:
            'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
          label: 'Google logo',
        },
      ],
    },
    editor: {
      fields: [
        // Simple list example.
        {
          type: 'exampleField',
          key: 'listSimple',
          docUrls: [
            {
              label: 'Config interface',
              url:
                'https://blinkkcode.github.io/selective-edit/interfaces/selective_field_list.listfieldconfig.html',
            },
          ],
          field: {
            type: 'list',
            key: 'listSimple',
            label: 'List (Simple)',
            fields: [
              {
                type: 'text',
                key: '',
              },
            ],
            validation: [
              {
                type: 'length',
                min: {
                  value: 1,
                },
                max: {value: 5},
              } as LengthRuleConfig,
            ],
          } as ListFieldConfig,
        } as ExampleFieldConfig,

        // Simple with complex list example.
        // Only one field, but with a non-simple field.
        // Should show as a normal list instead of a 'simple' list.
        {
          type: 'exampleField',
          key: 'listSimpleMedia',
          docUrls: [
            {
              label: 'Config interface',
              url:
                'https://blinkkcode.github.io/selective-edit/interfaces/selective_field_list.listfieldconfig.html',
            },
          ],
          field: {
            type: 'list',
            key: 'listSimpleMedia',
            label: 'List (Simple w/complex field)',
            addLabel: 'Add media',
            fields: [
              {
                type: 'media',
                key: '',
              },
            ],
          } as ListFieldConfig,
        } as ExampleFieldConfig,

        // Multi-field list example.
        {
          type: 'exampleField',
          key: 'listMulti',
          docUrls: [
            {
              label: 'Config interface',
              url:
                'https://blinkkcode.github.io/selective-edit/interfaces/selective_field_list.listfieldconfig.html',
            },
          ],
          field: {
            type: 'list',
            key: 'listMulti',
            label: 'List (Multiple fields)',
            fields: [
              {
                type: 'text',
                key: 'title',
                label: 'Title',
              },
              {
                type: 'text',
                key: 'subtitle',
                label: 'Sub title',
              },
              {
                type: 'media',
                key: 'media',
                label: 'Image',
              },
            ],
          } as ListFieldConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/list.yaml',
    },
    url: 'preview.html',
  },
  '/example/media.yaml': {
    editor: {
      fields: [
        // Media example.
        {
          type: 'exampleField',
          key: 'media',
          docUrls: [
            {
              label: 'Config interface',
              url:
                'https://blinkkcode.github.io/live-edit/interfaces/editor_field_media.mediafieldconfig.html',
            },
            {
              label: 'Generic config interface',
              url:
                'https://blinkkcode.github.io/selective-edit/interfaces/selective_field.fieldconfig.html',
            },
          ],
          field: {
            type: 'media',
            key: 'media',
            label: 'Media',
            validation: {
              path: [
                {
                  type: 'require',
                  message: 'Path is required.',
                },
              ],
              label: [
                {
                  type: 'require',
                  message: 'Label is required.',
                },
              ],
            },
          } as MediaFieldConfig,
        } as ExampleFieldConfig,

        // Media w/extra example.
        {
          type: 'exampleField',
          key: 'mediaExtra',
          docUrls: [
            {
              label: 'Config interface',
              url:
                'https://blinkkcode.github.io/live-edit/interfaces/editor_field_media.mediafieldconfig.html',
            },
            {
              label: 'Generic config interface',
              url:
                'https://blinkkcode.github.io/selective-edit/interfaces/selective_field.fieldconfig.html',
            },
          ],
          field: {
            type: 'media',
            key: 'mediaExtra',
            label: 'Media w/extra fields',
            fields: [
              {
                type: 'text',
                key: 'title',
                label: 'Title',
              },
              {
                type: 'textarea',
                key: 'description',
                label: 'Description',
              },
            ],
            validation: {
              path: [
                {
                  type: 'require',
                  message: 'Path is required.',
                },
              ],
            },
          } as MediaFieldConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/media.yaml',
    },
    url: 'preview.html',
  },
  '/example/mediaList.yaml': {
    data: {
      mediaList: [
        {
          url:
            'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
          label: 'Google logo',
        },
      ],
    },
    editor: {
      fields: [
        // Media example.
        {
          type: 'exampleField',
          key: 'mediaList',
          docUrls: [
            {
              label: 'Config interface',
              url:
                'https://blinkkcode.github.io/live-edit/interfaces/editor_field_media.mediafieldconfig.html',
            },
            {
              label: 'Generic config interface',
              url:
                'https://blinkkcode.github.io/selective-edit/interfaces/selective_field.fieldconfig.html',
            },
          ],
          field: {
            type: 'mediaList',
            key: 'mediaList',
            label: 'Media list',
          } as MediaFieldConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/mediaList.yaml',
    },
    url: 'preview.html',
  },
  '/example/standard.yaml': {
    editor: {
      fields: [
        // Text example.
        {
          type: 'exampleField',
          key: 'text',
          docUrls: [
            {
              label: 'Config interface',
              url:
                'https://blinkkcode.github.io/selective-edit/interfaces/selective_field_text.textfieldconfig.html',
            },
          ],
          field: {
            type: 'text',
            key: 'text',
            label: 'Title',
            validation: [
              {
                type: 'require',
                message: 'Title is required.',
              },
            ],
          } as TextFieldConfig,
        } as ExampleFieldConfig,

        // Textarea example.
        {
          type: 'exampleField',
          key: 'textarea',
          docUrls: [
            {
              label: 'Config interface',
              url:
                'https://blinkkcode.github.io/selective-edit/interfaces/selective_field_textarea.textareafieldconfig.html',
            },
          ],
          field: {
            type: 'textarea',
            key: 'description',
            label: 'Description',
          } as TextAreaFieldConfig,
        } as ExampleFieldConfig,

        // Checkbox example.
        {
          type: 'exampleField',
          key: 'isVisible',
          docUrls: [
            {
              label: 'Config interface',
              url:
                'https://blinkkcode.github.io/selective-edit/interfaces/selective_field_checkbox.checkboxfieldconfig.html',
            },
          ],
          field: {
            type: 'checkbox',
            key: 'isVisible',
            label: 'Is visible?',
          } as CheckboxFieldConfig,
        } as ExampleFieldConfig,

        // Checkbox multi example.
        {
          type: 'exampleField',
          key: 'options',
          docUrls: [
            {
              label: 'Config interface',
              url:
                'https://blinkkcode.github.io/selective-edit/interfaces/selective_field_checkboxmulti.checkboxmultifieldconfig.html',
            },
          ],
          field: {
            type: 'checkboxMulti',
            key: 'options',
            label: 'View options',
            options: [
              {
                label: 'Option 1',
                value: 'option-1',
              },
              {
                label: 'Option 2',
                value: 'option-2',
              },
              {
                label: 'Option 3',
                value: 'option-3',
              },
            ],
          } as CheckboxMultiFieldConfig,
        } as ExampleFieldConfig,

        // Radio example.
        {
          type: 'exampleField',
          key: 'skyColor',
          docUrls: [
            {
              label: 'Config interface',
              url:
                'https://blinkkcode.github.io/selective-edit/interfaces/selective_field_radio.radiofieldconfig.html',
            },
          ],
          field: {
            type: 'radio',
            key: 'skyColor',
            label: 'Current sky color',
            options: [
              {
                label: 'Cloudy sky',
                value: 'cloudy',
                color: '#dde5f2',
              },
              {
                label: 'Blue sky',
                value: 'blue',
                color: '#006beb',
              },
              {
                label: 'Night sky',
                value: 'night',
                color: '#131862',
              },
              {
                label: 'Stormy sky',
                value: 'stormy',
                gradient: {
                  colors: ['#57728f', '#2e5073', '#24405c'],
                  isSmooth: true,
                },
              },
              {
                label: 'Sunset sky',
                value: 'sunset',
                gradient: {
                  colors: ['#e85566', '#f47b5a', '#f9ac5e'],
                  orientation: 'slope',
                },
              },
            ],
          } as RadioFieldConfig,
        } as ExampleFieldConfig,

        // Number example.
        {
          type: 'exampleField',
          key: 'napsInADay',
          docUrls: [
            {
              label: 'Config interface',
              url:
                'https://blinkkcode.github.io/selective-edit/interfaces/selective_field_number.numberfieldconfig.html',
            },
          ],
          field: {
            type: 'number',
            key: 'napsInADay',
            label: 'Naps in a day',
            help: 'How many naps should there be in a day?',
            max: 100,
            min: 0,
          } as NumberFieldConfig,
        } as ExampleFieldConfig,

        // Color example.
        {
          type: 'exampleField',
          key: 'favoriteColor',
          docUrls: [
            {
              label: 'Module',
              url:
                'https://blinkkcode.github.io/selective-edit/modules/selective_field_color.html',
            },
          ],
          field: {
            type: 'color',
            key: 'favoriteColor',
            label: 'What is your favorite color?',
          } as ColorFieldConfig,
        } as ExampleFieldConfig,

        // Date example.
        {
          type: 'exampleField',
          key: 'birthdate',
          docUrls: [
            {
              label: 'Module',
              url:
                'https://blinkkcode.github.io/selective-edit/modules/selective_field_date.html',
            },
          ],
          field: {
            type: 'date',
            key: 'birthdate',
            label: 'Birth date',
          } as DateFieldConfig,
        } as ExampleFieldConfig,

        // Datetime example.
        {
          type: 'exampleField',
          key: 'naptime',
          docUrls: [
            {
              label: 'Module',
              url:
                'https://blinkkcode.github.io/selective-edit/modules/selective_field_datetime.html',
            },
          ],
          field: {
            type: 'datetime',
            key: 'naptime',
            label: 'Next nap time',
          } as DatetimeFieldConfig,
        } as ExampleFieldConfig,

        // Time example.
        {
          type: 'exampleField',
          key: 'wakeuptime',
          docUrls: [
            {
              label: 'Module',
              url:
                'https://blinkkcode.github.io/selective-edit/modules/selective_field_time.html',
            },
          ],
          field: {
            type: 'time',
            key: 'wakeuptime',
            label: 'Time to wake up',
          } as TimeFieldConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/standard.yaml',
    },
    url: 'preview.html',
  },
  '/example/structure.yaml': {
    data: {
      group: {
        title: 'testing',
      },
    },
    editor: {
      fields: [
        // Group example.
        {
          type: 'exampleField',
          key: 'group',
          cleanerKeys: ['isExpanded'],
          docUrls: [
            {
              label: 'Config interface',
              url:
                'https://blinkkcode.github.io/selective-edit/interfaces/selective_field_group.groupfieldconfig.html',
            },
          ],
          field: {
            type: 'group',
            key: 'group',
            label: 'Group',
            previewFields: ['title'],
            fields: [
              {
                type: 'text',
                key: 'title',
                label: 'Title',
              } as TextFieldConfig,
            ],
          } as GroupFieldConfig,
        } as ExampleFieldConfig,

        // Variant example.
        {
          type: 'exampleField',
          key: 'variant',
          cleanerKeys: ['isExpanded'],
          docUrls: [
            {
              label: 'Config interface',
              url:
                'https://blinkkcode.github.io/selective-edit/interfaces/selective_field_variant.variantfieldconfig.html',
            },
            {
              label: 'Option interface',
              url:
                'https://blinkkcode.github.io/selective-edit/interfaces/selective_field_variant.variantoptionconfig.html',
            },
          ],
          field: {
            type: 'variant',
            key: 'variant',
            label: 'Variant',
            variants: {
              hero: {
                label: 'Hero',
                fields: [
                  {
                    type: 'text',
                    key: 'title',
                    label: 'Hero Title',
                  } as TextFieldConfig,
                ],
              },
              heroWithImage: {
                label: 'Hero with Image',
                fields: [
                  {
                    type: 'text',
                    key: 'title',
                    label: 'Hero Title',
                  } as TextFieldConfig,
                  {
                    type: 'media',
                    key: 'media',
                    label: 'Hero image',
                  } as MediaFieldConfig,
                ],
              },
            },
          } as VariantFieldConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/structure.yaml',
    },
    url: 'preview.html',
  },
  '/example/utility.yaml': {
    editor: {
      fields: [
        // Aside example.
        {
          type: 'exampleField',
          key: 'aside',
          docUrls: [
            {
              label: 'Config interface',
              url:
                'https://blinkkcode.github.io/live-edit/interfaces/editor_field_aside.asidefieldconfig.html',
            },
          ],
          field: {
            type: 'aside',
            key: '',
            source:
              'Use **markdown** to provide more information to the user.\n\nIt does not save as part of the data, purely informational.',
          } as AsideFieldConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/utility.yaml',
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

      const url = new URL(window.location.toString());
      url.searchParams.set('path', file.path);
      window.history.pushState({}, '', url.toString());

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
            } as TextFieldConfig,
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

  async saveFile(file: EditorFileData): Promise<EditorFileData> {
    return new Promise<EditorFileData>((resolve, reject) => {
      const methodName = 'saveFile';
      console.log(`API: ${methodName}`, file);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to save the file.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      fullFiles[file.file.path] = file;

      simulateNetwork(
        resolve,
        fullFiles[file.file.path] || DEFAULT_EDITOR_FILE
      );
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
