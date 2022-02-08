import {
  AmagakiProjectTypeApi,
  ApiError,
  ApiErrorCode,
  ApiProjectTypes,
  AuthenticationData,
  DeviceData,
  EditorFileData,
  EditorPreviewSettings,
  EmptyData,
  FileData,
  GrowProjectTypeApi,
  LiveEditorApiComponent,
  OnboardingFlow,
  OnboardingInfo,
  OnboardingStatus,
  PartialData,
  PreviewSettings,
  ProjectData,
  ProjectPublishConfig,
  ProjectSource,
  PublishResult,
  PublishStatus,
  UrlLevel,
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
import {AmagakiDocumentConfig} from '../projectType/amagaki/field/document';
import {AmagakiStaticConfig} from '../projectType/amagaki/field/static';
import {AmagakiStringConfig} from '../projectType/amagaki/field/string';
import {AmagakiYamlConfig} from '../projectType/amagaki/field/yaml';
import {AsideFieldConfig} from '../editor/field/aside';
import {ExampleFieldConfig} from './field/exampleField';
import {GenericPartialsFieldConfig} from '../projectType/generic/field/partials';
import {GrowDocumentConfig} from '../projectType/grow/field/document';
import {GrowStaticConfig} from '../projectType/grow/field/static';
import {GrowStringConfig} from '../projectType/grow/field/string';
import {GrowYamlConfig} from '../projectType/grow/field/yaml';
import {HtmlFieldConfig} from '../editor/field/html';
import {MarkdownFieldConfig} from '../editor/field/markdown';
import {MediaFieldConfig} from '../editor/field/media';

const MAX_RESPONSE_MS = 1200;
const MIN_RESPONSE_MS = 250;

interface SimulateNetworkOptions {
  /**
   * Maximum time a simulated request should take.
   */
  maxResponseMs?: number;
  /**
   * Minimum time a simulated request should take.
   */
  minResponseMs?: number;
  /**
   * When true the network simulation is skipped and response instantly.
   */
  noNetworkSimulation?: boolean;
}

/**
 * Simulate having the request be slowed down by a network.
 *
 * @param callback Callback after 'network' lag complete.
 * @param response Response for the callback.
 */
function simulateNetwork(
  callback: Function,
  response: any,
  options?: SimulateNetworkOptions
) {
  if (options?.noNetworkSimulation) {
    callback(response);
    return;
  }

  const maxReponse = options?.maxResponseMs || MAX_RESPONSE_MS;
  const minReponse = options?.minResponseMs || MIN_RESPONSE_MS;

  setTimeout(() => {
    callback(response);
  }, Math.random() * (maxReponse - minReponse) + minReponse);
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
  urls: [
    {
      url: '#private',
      label: 'Live editor preview',
      level: UrlLevel.Private,
    },
    {
      url: '#protected',
      label: 'Staging',
      level: UrlLevel.Protected,
    },
    {
      url: '#public',
      label: 'Live',
      level: UrlLevel.Public,
    },
    {
      url: 'https://github.com/blinkk/editor.dev-ui/',
      label: 'View in GitHub',
      level: UrlLevel.Source,
    },
  ],
};

const fullFiles: Record<string, EditorFileData> = {
  '/content/pages/auto-guess.yaml': {
    data: {
      title: 'Testing',
    },
    dataRaw: 'title: Testing',
    file: {
      path: '/content/pages/auto-guess.yaml',
    },
  },
  '/example/html.yaml': {
    editor: {
      fields: [
        // Html example.
        {
          type: 'exampleField',
          key: 'htmlSmall',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/editor_field_html.HtmlFieldConfig.html',
            },
            {
              label: 'Generic config interface',
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field.FieldConfig.html',
            },
          ],
          field: {
            type: 'html',
            key: 'html',
            label: 'Html (small)',
            size: 'small',
          } as HtmlFieldConfig,
        } as ExampleFieldConfig,
        {
          type: 'exampleField',
          key: 'htmlMedium',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/editor_field_html.HtmlFieldConfig.html',
            },
            {
              label: 'Generic config interface',
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field.FieldConfig.html',
            },
          ],
          field: {
            type: 'html',
            key: 'html',
            label: 'Html (medium)',
            size: 'medium',
          } as HtmlFieldConfig,
        } as ExampleFieldConfig,
        {
          type: 'exampleField',
          key: 'htmlLarge',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/editor_field_html.HtmlFieldConfig.html',
            },
            {
              label: 'Generic config interface',
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field.FieldConfig.html',
            },
          ],
          field: {
            type: 'html',
            key: 'html',
            label: 'Html (large)',
            size: 'large',
          } as HtmlFieldConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/html.yaml',
    },
    url: 'preview.html',
  },
  '/example/list.yaml': {
    data: {
      listSimple: ['values', 'in', 'a', 'list'],
      listSimpleMedia: [
        {
          path: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
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
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field_list.ListFieldConfig.html',
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
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field_list.ListFieldConfig.html',
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
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field_list.ListFieldConfig.html',
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
  '/example/markdown.yaml': {
    editor: {
      fields: [
        // Markdown example.
        {
          type: 'exampleField',
          key: 'markdown-small',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/editor_field_markdown.MarkdownFieldConfig.html',
            },
            {
              label: 'Generic config interface',
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field.FieldConfig.html',
            },
          ],
          field: {
            type: 'markdown',
            key: 'markdown',
            label: 'Markdown (small)',
            size: 'small',
          } as MarkdownFieldConfig,
        } as ExampleFieldConfig,
        {
          type: 'exampleField',
          key: 'markdown-medium',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/editor_field_markdown.MarkdownFieldConfig.html',
            },
            {
              label: 'Generic config interface',
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field.FieldConfig.html',
            },
          ],
          field: {
            type: 'markdown',
            key: 'markdown',
            label: 'Markdown (medium)',
            size: 'medium',
          } as MarkdownFieldConfig,
        } as ExampleFieldConfig,
        {
          type: 'exampleField',
          key: 'markdown-large',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/editor_field_markdown.MarkdownFieldConfig.html',
            },
            {
              label: 'Generic config interface',
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field.FieldConfig.html',
            },
          ],
          field: {
            type: 'markdown',
            key: 'markdown',
            label: 'Markdown (large)',
            size: 'large',
          } as MarkdownFieldConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/markdown.yaml',
    },
    url: 'preview.html',
  },
  '/example/media.yaml': {
    data: {
      media: {
        path: '/static/img/landscape.png',
        label: 'Landscape image',
      },
    },
    editor: {
      fields: [
        // Media example.
        {
          type: 'exampleField',
          key: 'media',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/editor_field_media.MediaFieldConfig.html',
            },
            {
              label: 'Generic config interface',
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field.FieldConfig.html',
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
              url: 'https://editor.dev/api/ui/interfaces/editor_field_media.MediaFieldConfig.html',
            },
            {
              label: 'Generic config interface',
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field.FieldConfig.html',
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
          path: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
          label: 'Google logo',
        },
      ],
      mediaListExtra: [
        {
          url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
          label: 'Google logo',
        },
      ],
    },
    editor: {
      fields: [
        // Media list example.
        {
          type: 'exampleField',
          key: 'mediaList',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/editor_field_media.MediaFieldConfig.html',
            },
            {
              label: 'Generic config interface',
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field.FieldConfig.html',
            },
          ],
          field: {
            type: 'mediaList',
            key: 'mediaList',
            label: 'Media list',
          } as MediaFieldConfig,
        } as ExampleFieldConfig,
        {
          type: 'exampleField',
          key: 'mediaListExtra',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/editor_field_media.MediaFieldConfig.html',
            },
            {
              label: 'Generic config interface',
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field.FieldConfig.html',
            },
          ],
          field: {
            type: 'mediaList',
            key: 'mediaList',
            label: 'Media list w/extra fields',
            fieldConfig: {
              type: 'media',
              label: 'Media w/extra fields',
              fields: [
                {
                  type: 'checkbox',
                  key: 'loop',
                  label: 'Loop?',
                },
              ],
            },
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
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field_text.TextFieldConfig.html',
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
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field_textarea.TextAreaFieldConfig.html',
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
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field_checkbox.CheckboxFieldConfig.html',
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
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field_checkboxMulti.CheckboxMultiFieldConfig.html',
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
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field_radio.RadioFieldConfig.html',
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
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field_number.NumberFieldConfig.html',
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
              url: 'https://blinkk.github.io/selective-edit/modules/selective_field_color.html',
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
              url: 'https://blinkk.github.io/selective-edit/modules/selective_field_date.html',
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
              url: 'https://blinkk.github.io/selective-edit/modules/selective_field_datetime.html',
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
              url: 'https://blinkk.github.io/selective-edit/modules/selective_field_time.html',
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
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field_group.GroupFieldConfig.html',
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
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field_variant.VariantFieldConfig.html',
            },
            {
              label: 'Option interface',
              url: 'https://blinkk.github.io/selective-edit/interfaces/selective_field_variant.VariantOptionConfig.html',
            },
          ],
          field: {
            type: 'variant',
            key: 'variant',
            label: 'Variant',
            help: 'Allows the user to choose between different sets of fields to edit.',
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
              url: 'https://editor.dev/api/ui/interfaces/editor_field_aside.AsideFieldConfig.html',
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
  '/example/amagaki/document.yaml': {
    editor: {
      fields: [
        // Amagaki document examples.
        {
          type: 'exampleField',
          key: 'document',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/projectType_amagaki_field_document.AmagakiDocumentConfig.html',
            },
          ],
          field: {
            type: 'amagakiDocument',
            key: 'doc',
            label: 'Amagaki document',
            help: 'In yaml: !pod.document: <document path>',
            validation: [
              {
                type: 'require',
                message: 'Document is required.',
              },
            ],
          } as AmagakiDocumentConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/amagaki/document.yaml',
    },
    url: 'preview.html',
  },
  '/example/amagaki/partials.yaml': {
    data: {
      partials: [
        {
          partial: 'example',
          title: 'Partial example 1',
        },
        {
          partial: 'example',
          title: 'Partial example 2',
        },
        {
          partial: 'example',
          title: 'Partial example 3',
        },
        {
          partial: 'example',
          title: 'Partial example 4',
        },
        {
          partial: 'example',
          title: 'Partial example 5',
        },
        {
          partial: 'example',
          title: 'Partial example 6',
        },
      ],
    },
    editor: {
      fields: [
        // Amagaki partials examples.
        {
          type: 'exampleField',
          key: 'partials',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/projectType_generic_field_partials.GenericPartialsFieldConfig.html',
            },
          ],
          field: {
            type: 'amagakiPartials',
            key: 'partials',
            label: 'Amagaki partials',
            validation: [
              {
                type: 'length',
                min: {
                  value: 1,
                },
                max: {value: 5},
              } as LengthRuleConfig,
            ],
          } as GenericPartialsFieldConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/amagaki/partials.yaml',
    },
    url: 'preview.html',
  },
  '/example/amagaki/static.yaml': {
    editor: {
      fields: [
        // Amagaki static file examples.
        {
          type: 'exampleField',
          key: 'static',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/projectType_amagaki_field_static.AmagakiStaticConfig.html',
            },
          ],
          field: {
            type: 'amagakiStatic',
            key: 'doc',
            label: 'Amagaki static file',
            help: 'In yaml: !pod.staticFile: <static file path>',
          } as AmagakiStaticConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/amagaki/static.yaml',
    },
    url: 'preview.html',
  },
  '/example/amagaki/string.yaml': {
    editor: {
      fields: [
        // Amagaki string examples.
        {
          type: 'exampleField',
          key: 'string',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/projectType_amagaki_field_string.AmagakiStringConfig.html',
            },
          ],
          field: {
            type: 'amagakiString',
            key: 'string',
            label: 'Amagaki string',
            help: 'In yaml: !pod.string: { value: "<string value>" }',
          } as AmagakiStringConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/amagaki/string.yaml',
    },
    url: 'preview.html',
  },
  '/example/amagaki/yaml.yaml': {
    editor: {
      fields: [
        // Amagaki yaml examples.
        {
          type: 'exampleField',
          key: 'yaml',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/projectType_amagaki_field_yaml.AmagakiYamlConfig.html',
            },
          ],
          field: {
            type: 'amagakiYaml',
            key: 'yaml',
            label: 'Amagaki yaml',
            help: 'In yaml: !pod.yaml: { value: "<yaml file and query reference>" }',
          } as AmagakiYamlConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/amagaki/yaml.yaml',
    },
    url: 'preview.html',
  },
  '/example/grow/document.yaml': {
    editor: {
      fields: [
        // Grow document examples.
        {
          type: 'exampleField',
          key: 'document',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/projectType_grow_field_document.GrowDocumentConfig.html',
            },
          ],
          field: {
            type: 'growDocument',
            key: 'doc',
            label: 'Grow document',
            help: 'In yaml: !g.doc: <document path>',
            validation: [
              {
                type: 'require',
                message: 'Document is required.',
              },
            ],
          } as GrowDocumentConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/grow/document.yaml',
    },
    url: 'preview.html',
  },
  '/example/grow/partials.yaml': {
    data: {
      partials: [
        {
          partial: 'example',
          title: 'Partial example',
        },
      ],
    },
    editor: {
      fields: [
        // Grow partials examples.
        {
          type: 'exampleField',
          key: 'partials',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/projectType_generic_field_partials.GenericPartialsFieldConfig.html',
            },
          ],
          field: {
            type: 'growPartials',
            key: 'partials',
            label: 'Grow partials',
            validation: [
              {
                type: 'length',
                min: {
                  value: 1,
                },
                max: {value: 5},
              } as LengthRuleConfig,
            ],
          } as GenericPartialsFieldConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/grow/partials.yaml',
    },
    url: 'preview.html',
  },
  '/example/grow/static.yaml': {
    editor: {
      fields: [
        // Grow static file examples.
        {
          type: 'exampleField',
          key: 'static',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/projectType_grow_field_static.GrowStaticConfig.html',
            },
          ],
          field: {
            type: 'growStatic',
            key: 'static',
            label: 'Grow static',
            help: 'In yaml: !g.static: <static file path>',
            validation: [
              {
                type: 'require',
                message: 'Static file is required.',
              },
            ],
          } as GrowStaticConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/grow/static.yaml',
    },
    url: 'preview.html',
  },
  '/example/grow/string.yaml': {
    editor: {
      fields: [
        // Grow string examples.
        {
          type: 'exampleField',
          key: 'string',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/projectType_grow_field_string.GrowStringConfig.html',
            },
          ],
          field: {
            type: 'growString',
            key: 'string',
            label: 'Grow string',
            help: 'In yaml: !g.string: <string reference>',
          } as GrowStringConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/grow/string.yaml',
    },
    url: 'preview.html',
  },
  '/example/grow/yaml.yaml': {
    editor: {
      fields: [
        // Grow yaml examples.
        {
          type: 'exampleField',
          key: 'yaml',
          docUrls: [
            {
              label: 'Config interface',
              url: 'https://editor.dev/api/ui/interfaces/projectType_grow_field_yaml.GrowYamlConfig.html',
            },
          ],
          field: {
            type: 'growYaml',
            key: 'yaml',
            label: 'Grow yaml',
            help: 'In yaml: !g.yaml: <yaml file and query reference>',
          } as GrowYamlConfig,
        } as ExampleFieldConfig,
      ],
    },
    file: {
      path: '/example/grow/yaml.yaml',
    },
    url: 'preview.html',
  },
};

const currentFileset: Array<FileData> = [
  {
    path: '/content/pages/index.yaml',
  },
  {
    path: '/content/pages/really-long-page-name-that-gets-truncated-in-ui.yaml',
  },
  {
    path: '/content/pages/about.md',
  },
  {
    path: '/content/pages/contact.yaml',
  },
  {
    path: '/static/img/landscape.png',
  },
  {
    path: '/static/img/portrait.png',
  },
  {
    path: '/static/img/square.png',
  },
];

// Pull in the fullFiles automatically.
for (const key of Object.keys(fullFiles)) {
  currentFileset.push(fullFiles[key].file);
}

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

export type ExampleApiOptions = SimulateNetworkOptions;

/**
 * Example api that returns data through a 'simulated' network.
 */
export class ExampleApi implements LiveEditorApiComponent {
  errorController: ErrorController;
  workflow: WorkspaceWorkflow;
  options?: ExampleApiOptions;
  projectTypes: ApiProjectTypes;

  constructor(options?: ExampleApiOptions) {
    this.options = options;
    this.errorController = new ErrorController();
    this.workflow = WorkspaceWorkflow.Success;
    this.projectTypes = {
      amagaki: new ExampleAmagakiApi(this.errorController, this.options),
      grow: new ExampleGrowApi(this.errorController, this.options),
    };
  }

  checkAuth(): boolean {
    return true;
  }

  async checkOnboarding(): Promise<OnboardingInfo> {
    return new Promise<OnboardingInfo>((resolve, reject) => {
      const methodName = 'checkOnboarding';
      console.log(`API: ${methodName}`);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to check onboarding.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      // TODO: Allow the tool to give different onboarding info.
      simulateNetwork(
        resolve,
        {
          status: OnboardingStatus.Valid,
          flow: OnboardingFlow.Local,
        } as OnboardingInfo,
        {
          // Do not need to slow down the normal example loading.
          // But may be useful later?
          noNetworkSimulation: true,
        }
      );
    });
  }

  async clearAuth(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const methodName = 'clearAuth';
      console.log(`API: ${methodName}`);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to clear authentication.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      console.info('Example authentication cleared!');

      simulateNetwork(resolve, null, {
        // Do not need to slow down the normal example loading.
        // But may be useful later?
        noNetworkSimulation: true,
      });
    });
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
      simulateNetwork(resolve, newFile, this.options);
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
      simulateNetwork(resolve, newFile, this.options);
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
      simulateNetwork(resolve, newWorkspace, this.options);
    });
  }

  async deleteFile(file: FileData): Promise<EmptyData> {
    return new Promise<EmptyData>((resolve, reject) => {
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

      simulateNetwork(resolve, {}, this.options);
    });
  }

  async getAuthentication(): Promise<AuthenticationData> {
    return new Promise<AuthenticationData>((resolve, reject) => {
      const methodName = 'getAuthentication';
      console.log(`API: ${methodName}`);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to get the devices.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      simulateNetwork(
        resolve,
        {
          usesAccounts: true,
        } as AuthenticationData,
        this.options
      );
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

      simulateNetwork(
        resolve,
        [
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
        ],
        this.options
      );
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

      // If file does not 'exist', return error for missing file.
      let fileExists = false;
      for (const currentFile of currentFileset) {
        if (currentFile.path === file.path) {
          fileExists = true;
          break;
        }
      }
      if (!fileExists) {
        reject({
          message: `File not found: ${file.path}.`,
          description: 'Example does not have information about the file.',
          errorCode: ApiErrorCode.FileNotFound,
        } as ApiError);
        return;
      }

      const url = new URL(window.location.toString());
      url.searchParams.set('path', file.path);
      window.history.pushState({}, '', url.toString());

      // Use the default editor file with the current file path.
      const defaultFile = Object.assign({}, DEFAULT_EDITOR_FILE, {
        file: {
          path: file.path,
        },
      });

      simulateNetwork(
        resolve,
        fullFiles[file.path] || defaultFile,
        this.options
      );
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

      simulateNetwork(resolve, [...currentFileset], this.options);
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
      simulateNetwork(
        resolve,
        {
          path: file.path,
          url: 'image-landscape.png',
        } as FileData,
        this.options
      );
    });
  }

  async getPreviewConfig(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    settings: EditorPreviewSettings,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    workspace: WorkspaceData
  ): Promise<PreviewSettings> {
    return new Promise<PreviewSettings>((resolve, reject) => {
      const methodName = 'getPreviewConfig';
      console.log(`API: ${methodName}`);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to get the preview settings.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      /**
       * Map the paths to the serving urls.
       */
      simulateNetwork(
        resolve,
        {
          defaultLocale: 'en',
          routes: {
            '/content/pages/index.yaml': {
              en: {
                path: '/preview.html',
              },
            },
            '/example/amagaki/partials.yaml': {
              en: {
                path: '/preview.html',
              },
            },
            '/example/grow/partials.yaml': {
              en: {
                path: '/preview.html',
              },
            },
            '/static/img/landscape.png': {
              path: '/image-landscape.png',
            },
            '/static/img/portrait.png': {
              path: '/image-portrait.png',
            },
            '/static/img/square.png': {
              path: '/image-square.png',
            },
          },
        } as PreviewSettings,
        this.options
      );
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

      simulateNetwork(
        resolve,
        {
          title: 'Example project',
          publish: publish,
          preview: {
            // Use the current server for the preview for the example since it is
            // referencing a static file for the example preview.
            baseUrl: `http://${window.location.host}/`,
          },
          source: {
            source: ProjectSource.Example,
            label: 'Example source',
            identifier: 'example',
          },
          users: [
            {
              name: 'Example User',
              email: 'example@example.com',
            },
            {
              name: 'Domain users',
              email: '@domain.com',
              isGroup: true,
            },
          ],
        } as ProjectData,
        this.options
      );
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

      simulateNetwork(resolve, currentWorkspace, this.options);
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

      simulateNetwork(resolve, [...currentWorkspaces], this.options);
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

      simulateNetwork(resolve, currentWorkspace, this.options);
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

      simulateNetwork(
        resolve,
        {
          status: status,
          workspace: responseWorkspace,
        },
        this.options
      );
    });
  }

  async saveFile(
    file: EditorFileData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isRawEdit: boolean
  ): Promise<EditorFileData> {
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
        fullFiles[file.file.path] || DEFAULT_EDITOR_FILE,
        this.options
      );
    });
  }

  async updateOnboarding(info: OnboardingInfo): Promise<OnboardingInfo> {
    return new Promise<OnboardingInfo>((resolve, reject) => {
      const methodName = 'updateOnboarding';
      console.log(`API: ${methodName}`);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to update onboarding.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      // TODO: Allow the tool to give different onboarding info.
      simulateNetwork(resolve, info, {
        // Do not need to slow down the normal example loading.
        // But may be useful later?
        noNetworkSimulation: true,
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

      simulateNetwork(
        resolve,
        {
          path: '/static/img/portrait.png',
          url: 'image-portrait.png',
        } as FileData,
        this.options
      );
    });
  }
}

export class ExampleAmagakiApi implements AmagakiProjectTypeApi {
  errorController: ErrorController;
  options?: ExampleApiOptions;

  constructor(errorController: ErrorController, options?: ExampleApiOptions) {
    this.errorController = errorController;
    this.options = options;
  }

  async getPartials(): Promise<Record<string, PartialData>> {
    return new Promise<Record<string, PartialData>>((resolve, reject) => {
      const methodName = 'getPartials';
      console.log(`Amagaki API: ${methodName}`);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to get the partials.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      simulateNetwork(
        resolve,
        {
          example: {
            editor: {
              label: 'Example',
              previewFields: ['title'],
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
          } as PartialData,
          hidden: {
            editor: {
              label: 'Hidden partial',
              fields: [
                {
                  type: 'text',
                  key: 'title',
                  label: 'title',
                } as TextFieldConfig,
              ],
              isHidden: true,
            },
          } as PartialData,
        },
        this.options
      );
    });
  }
}

export class ExampleGrowApi implements GrowProjectTypeApi {
  errorController: ErrorController;
  options?: ExampleApiOptions;

  constructor(errorController: ErrorController, options?: ExampleApiOptions) {
    this.errorController = errorController;
    this.options = options;
  }

  async getPartials(): Promise<Record<string, PartialData>> {
    return new Promise<Record<string, PartialData>>((resolve, reject) => {
      const methodName = 'getPartials';
      console.log(`Grow API: ${methodName}`);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to get the partials.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      simulateNetwork(
        resolve,
        {
          example: {
            editor: {
              label: 'Example',
              previewFields: ['title'],
              fields: [
                {
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
              ],
            },
          } as PartialData,
        },
        this.options
      );
    });
  }

  async getStrings(): Promise<Record<string, any>> {
    return new Promise<Record<string, any>>((resolve, reject) => {
      const methodName = 'getStrings';
      console.log(`Grow API: ${methodName}`);

      if (this.errorController.shouldError(methodName)) {
        reject({
          message: 'Failed to get the strings.',
          description: 'Api is set to always return an error.',
        } as ApiError);
        return;
      }

      simulateNetwork(
        resolve,
        {
          '/content/strings/example.yaml': {
            title: 'example',
            foo: {
              bar: '42',
            },
          },
          '/content/strings/foobar.yaml': {
            title: 'foobar',
            bar: 'anything',
            lorem: `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
            doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
            veritatis et quasi architecto beatae vitae dicta sunt explicabo.`,
          },
        },
        this.options
      );
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
