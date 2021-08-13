import {
  DataType,
  DeepObject,
  DroppableMixin,
  DroppableUiComponent,
  Field,
  FieldComponent,
  FieldConfig,
  GroupField,
  GroupFieldConfig,
  SelectiveEditor,
  TemplateResult,
  Types,
  classMap,
  html,
} from '@blinkk/selective-edit';
import {
  EditorPreviewSettings,
  MediaFileData,
  PreviewRoutesLocaleData,
  WorkspaceData,
} from '../api';

import {EVENT_RENDER_COMPLETE} from '../events';
import {LiveEditorGlobalConfig} from '../editor';
import {Template} from '@blinkk/selective-edit/dist/selective/template';
import {findPreviewValue} from '@blinkk/selective-edit/dist/utility/preview';
import {interpolatePreviewUrl} from '../preview';
import merge from 'lodash.merge';
import {reduceFraction} from '../../utility/math';
import {templateLoading} from '../template';

export const DEFAULT_EXTRA_KEY = 'extra';
export const EXT_TO_MIME_TYPE: Record<string, string> = {
  apng: 'image/apng',
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpg',
  jpg: 'image/jpg',
  mp4: 'image/mp4',
  mov: 'image/mov',
  png: 'image/png',
  svg: 'image/svg+xml',
  webm: 'image/webm',
  webp: 'image/webp',
};
export const VALID_IMAGE_MIME_TYPES = [
  'image/apng',
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
];
export const VALID_VIDEO_MIME_TYPES = ['image/mp4', 'image/mov', 'image/webm'];

export interface MediaFieldConfig extends FieldConfig {
  /**
   * Valid mime or file types that the field accepts.
   *
   * Defaults to {@link VALID_IMAGE_MIME_TYPES} and {@link VALID_VIDEO_MIME_TYPES}.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers
   */
  accepted?: Array<string>;
  /**
   * Key to use for the data for the 'extra' fields.
   *
   * For example, if the `extraKey` is `foo` then the data
   * would look similar to:
   *
   * ```yaml
   * path: /path/to/file.png
   * foo:
   *   title: testing
   * ```
   */
  extraKey?: string;
  /**
   * Label to use for the 'extra' fields.
   */
  extraLabel?: string;
  /**
   * Fields to be grouped.
   */
  fields?: Array<FieldConfig>;
  /**
   * Are the extra fields expanded to show the fields?
   *
   * Set to `true` to expand the extra fields by default.
   */
  isExpanded?: boolean;
  /**
   * Placeholder for the path input.
   */
  placeholder?: string;
  /**
   * Placeholder for the label input.
   */
  placeholderLabel?: string;
  /**
   * Preview field keys.
   *
   * When showing a preview of the group, use these field keys to determine
   * the value to show for the preview.
   *
   * If no fields are no preview will be shown for the group when collapsed.
   */
  previewFields?: Array<string>;
  /**
   * Override the default media upload provider to determine if the upload
   * should be remote.
   */
  remote?: boolean;
}

export interface MediaFieldComponent extends FieldComponent {
  config: MediaFieldConfig;
  droppableUi: DroppableUiComponent;
  handleFiles(files: Array<File>): void;
  isProcessing?: boolean;
  templatePreviewMedia: Template;
  templatePreviewValue(
    editor: SelectiveEditor,
    data: DeepObject,
    index?: number
  ): TemplateResult;
}

export interface MediaMeta {
  height: number;
  width: number;
}

export class MediaField
  extends DroppableMixin(Field)
  implements MediaFieldComponent
{
  config: MediaFieldConfig;
  group?: GroupField;
  globalConfig: LiveEditorGlobalConfig;
  isProcessing?: boolean;
  meta?: MediaMeta;
  showFileUpload?: boolean;

  constructor(
    types: Types,
    config: MediaFieldConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'media'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
    this.globalConfig = globalConfig;
    this.droppableUi.validTypes = this.config.accepted || [
      ...VALID_IMAGE_MIME_TYPES,
      ...VALID_VIDEO_MIME_TYPES,
    ];
    this.droppableUi.listeners.add('files', this.handleFiles.bind(this));

    this.zones = {
      path: {
        key: 'path',
      },
      label: {
        key: 'label',
      },
    };
  }

  /**
   * Cleanup the media value.
   *
   * If the media field is used in a normal list it will have trouble
   * determining a default empty value.
   *
   * @param value Original value from the source.
   */
  cleanOriginalValue(value: any): any {
    value = super.cleanOriginalValue(value);

    // Default to object if original value is an empty string.
    if (value === '') {
      return {};
    }

    return value;
  }

  protected ensureGroup() {
    if (!this.group && this.config.fields) {
      this.group = this.types.fields.newFromKey(
        'group',
        this.types,
        {
          type: 'group',
          key: this.config.extraKey || DEFAULT_EXTRA_KEY,
          fields: this.config.fields,
          label:
            this.config.extraLabel ||
            this.globalConfig.labels.fieldMediaExtra ||
            'Extra',
          isExpanded: this.config.isExpanded,
          previewFields: this.config.previewFields,
        } as GroupFieldConfig,
        this.globalConfig
      ) as GroupField;
    }
  }

  /**
   * Handle when the accessibility label changes value.
   *
   * @param evt Input event from changing value.
   */
  handleA11yLabel(evt: Event) {
    const target = evt.target as HTMLInputElement;
    this.currentValue = merge({}, this.currentValue || {}, {
      _meta: this.meta,
      label: target.value,
    });
    this.render();
  }

  handleFiles(files: Array<File>) {
    this.isProcessing = true;
    this.render();

    // Uploads only the first file.
    this.uploadFile(files[0]).then(file => {
      this.currentValue = merge({}, this.currentValue || {}, {
        path: file.path,
        url: file.url,
      });

      this.showFileUpload = false;
      this.isProcessing = false;

      // Updating the current value does not change the input value.
      const inputField = document.querySelector(`#media-${this.uid}`);
      if (inputField) {
        (inputField as HTMLInputElement).value = file.url as string;
      }

      this.render();
    });
  }

  /**
   * Handle when the input changes value.
   *
   * @param evt Input event from changing value.
   */
  handleInput(evt: Event) {
    const target = evt.target as HTMLInputElement;
    this.currentValue = merge({}, this.currentValue || {}, {
      _meta: this.meta,
      path: target.value,
    });

    // Reset the url if it is loaded.
    this.currentValue.url = undefined;

    this.render();
  }

  /**
   * Handle when the input changes value.
   *
   * @param evt Input event from changing value.
   */
  handleFileUpload(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files) {
      return;
    }

    this.handleFiles([input.files[0]]);
    this.render();
  }

  handlePreviewMediaLoad(evt: Event) {
    const target = evt.target as HTMLImageElement;
    this.meta = {
      height: target.naturalHeight,
      width: target.naturalWidth,
    };

    this.currentValue = merge({}, this.currentValue || {}, {
      _meta: this.meta,
    });

    this.render();
  }

  handlePreviewVideoLoad(evt: Event) {
    const target = evt.target as HTMLVideoElement;
    this.meta = {
      height: target.videoHeight,
      width: target.videoWidth,
    };

    this.currentValue = merge({}, this.currentValue || {}, {
      _meta: this.meta,
    });

    this.render();
  }

  get isClean(): boolean {
    if (!this.group) {
      return super.isClean;
    }
    return super.isClean && this.group.isClean;
  }

  /**
   * Check if the data format is invalid for what the field expects to edit.
   */
  get isDataFormatValid(): boolean {
    if (this.originalValue === undefined || this.originalValue === null) {
      return true;
    }

    if (!DataType.isObject(this.originalValue)) {
      return false;
    }

    // Label needs to be a string.
    if (
      this.originalValue.label &&
      !DataType.isString(this.originalValue.label)
    ) {
      return false;
    }

    // Path needs to be a string.
    if (
      this.originalValue.path &&
      !DataType.isString(this.originalValue.path)
    ) {
      return false;
    }

    return true;
  }

  get isSimple(): boolean {
    // Media field has multiple inputs and is considered complex.
    return false;
  }

  get isValid(): boolean {
    if (!this.group) {
      return super.isValid;
    }
    return super.isValid && this.group.isValid;
  }

  /**
   * Retrieve the url for previewing the field.
   */
  get previewUrl(): string | undefined {
    const value = this.currentValue || {};
    if (value && value.url) {
      return value.url;
    }

    if (value && value.path && DataType.isString(value.path)) {
      if (
        value.path.startsWith('http:') ||
        value.path.startsWith('https:') ||
        value.path.startsWith('//')
      ) {
        return value.path;
      }
    }

    // Check the preview config to see if it knows the preview url.
    const previewConfig =
      this.globalConfig.state.previewConfigOrGetPreviewConfig();

    if (previewConfig?.routes[value.path]) {
      let path = '';
      if (previewConfig.routes[value.path].path) {
        path = previewConfig.routes[value.path].path as string;
      } else {
        path = (previewConfig.routes[value.path] as PreviewRoutesLocaleData)[
          previewConfig.defaultLocale
        ].path as string;
      }

      const previewUrl = interpolatePreviewUrl(
        this.globalConfig.state.project?.preview as EditorPreviewSettings,
        this.globalConfig.state.workspace as WorkspaceData,
        undefined,
        path
      );

      return previewUrl;
    }

    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templateAltLabel(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    return html`<div class="selective__media__a11y_label">
      <div class="selective__media__section__label">
        <label for="media-a11y-label-${this.uid}">
          ${this.globalConfig.labels.fieldMediaLabel ||
          'Media accessibility label'}
        </label>
      </div>

      <div class=${classMap(this.classesForInput('label'))}>
        <input
          type="text"
          id="media-a11y-label-${this.uid}"
          @input=${this.handleA11yLabel.bind(this)}
          value=${this.currentValue?.label || ''}
        />
      </div>

      ${this.templateErrors(editor, data, 'label')}
    </div>`;
  }

  templateFileUpload(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    editor: SelectiveEditor,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: DeepObject
  ): TemplateResult {
    if (!this.showFileUpload) {
      return html``;
    }

    return html`<div class="selective__media__upload">
      <input
        type="file"
        accept=${[...VALID_IMAGE_MIME_TYPES, ...VALID_VIDEO_MIME_TYPES].join(
          ','
        )}
        id="media-file-${this.uid}"
        @input=${this.handleFileUpload.bind(this)}
      />
    </div>`;
  }

  templateInput(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    const value = this.currentValue || {};
    const actions = [];

    this.ensureGroup();

    actions.push(html`<div
      class="selective__action"
      @click=${() => {
        this.showFileUpload = true;
        document.addEventListener(
          EVENT_RENDER_COMPLETE,
          () => {
            (
              document.querySelector(`#media-file-${this.uid}`) as HTMLElement
            ).click();
          },
          {
            once: true,
          }
        );

        this.render();
      }}
    >
      <i class="material-icons">upload</i>
    </div>`);

    return html`${this.templateHelp(editor, data)}
      <div
        class="selective__droppable__target"
        @dragenter=${this.droppableUi.handleDragEnter.bind(this.droppableUi)}
        @dragleave=${this.droppableUi.handleDragLeave.bind(this.droppableUi)}
        @dragover=${this.droppableUi.handleDragOver.bind(this.droppableUi)}
        @drop=${this.droppableUi.handleDrop.bind(this.droppableUi)}
      >
        <div class="selective__media__path">
          <div class="selective__media__section__label">
            <label for="media-${this.uid}"
              >${this.globalConfig.labels.fieldMediaPath || 'Media path'}</label
            >
          </div>
          <div class="selective__media__path__input">
            <div class=${classMap(this.classesForInput('path'))}>
              <input
                type="text"
                id="media-${this.uid}"
                placeholder=${this.config.placeholder || ''}
                @blur=${() => {
                  this.lostFocus('path');
                }}
                @input=${this.handleInput.bind(this)}
                value=${value.path || ''}
              />
            </div>
            ${this.isProcessing
              ? html`${templateLoading({padHorizontal: true})}`
              : ''}
            <div class="selective__field__actions">${actions}</div>
          </div>
        </div>
        ${this.templateFileUpload(editor, data)}
        ${this.templatePreview(editor, data)}
        ${this.templateErrors(editor, data, 'path')}
      </div>
      ${this.templateAltLabel(editor, data)}
      ${this.group?.template(editor, data) || ''}`;
  }

  templatePreview(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    const url = this.previewUrl;
    if (!url) {
      return html``;
    }

    return html`<div class="selective__media__preview">
      <div class="selective__media__preview_media">
        <div class="selective__media__section__label">
          ${this.globalConfig.labels.fieldMediaPreview || 'Media preview'}
        </div>
        ${this.templatePreviewMedia(editor, data)}
      </div>
      <div class="selective__media__meta">
        ${this.templatePreviewMeta(editor, data)}
      </div>
    </div>`;
  }

  /**
   * Template for how to render a preview.
   *
   * @param editor Selective editor used to render the template.
   * @param data Data provided to render the template.
   */
  templatePreviewValue(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    editor: SelectiveEditor,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: DeepObject,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    index?: number
  ): TemplateResult {
    return html`${findPreviewValue(
      this.currentValue,
      ['label'],
      'Untitled media'
    )}`;
  }

  templatePreviewMedia(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    editor: SelectiveEditor,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: DeepObject
  ): TemplateResult {
    const url = this.previewUrl;
    if (!url) {
      return html`<span class="material-icons">broken_image</span>`;
    }

    for (const fileExt of Object.keys(EXT_TO_MIME_TYPE)) {
      const extMimeType = EXT_TO_MIME_TYPE[fileExt];
      const isVideoFile = VALID_VIDEO_MIME_TYPES.includes(extMimeType);
      if (isVideoFile && url.endsWith(`.${fileExt}`)) {
        return html`<video
          data-serving-path=${url}
          @loadeddata=${this.handlePreviewVideoLoad.bind(this)}
          playsinline
          disableremoteplayback
          muted
          autoplay
          loop
        >
          <source src="${url}" />
        </video>`;
      }
    }

    return html`<img
      data-serving-path=${url}
      @load=${this.handlePreviewMediaLoad.bind(this)}
      src="${url}"
    />`;
  }

  templatePreviewMeta(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    editor: SelectiveEditor,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: DeepObject
  ): Array<TemplateResult> {
    if (!this.meta) {
      if (!this.currentValue?._meta) {
        return [html``];
      }
      this.meta = this.currentValue._meta;
    }

    const metaInfo: Array<TemplateResult> = [];

    metaInfo.push(html`<div
      class="selective__media__meta__item selective__media__meta__size"
    >
      <span class="selective__media__meta__label">Size:</span>
      <span class="selective__media__meta__value"
        >${this.meta?.width} x ${this.meta?.height}</span
      >
    </div>`);

    const ratio = reduceFraction(this.meta?.width || 1, this.meta?.height || 1);
    metaInfo.push(html`<div
      class="selective__media__meta__item selective__media__meta__ratio"
    >
      <span class="selective__media__meta__label">Ratio:</span>
      <span class="selective__media__meta__value">${ratio[0]}:${ratio[1]}</span>
    </div>`);

    return metaInfo;
  }

  async uploadFile(uploadFile: File): Promise<MediaFileData> {
    return this.globalConfig.api.uploadFile(
      uploadFile,
      this.globalConfig.state.getMediaOptions(this.config.remote)
    );
  }

  /**
   * Get the value for the field, optionally including the extra values.
   */
  get value() {
    const extraValue: Record<string, any> = {};
    if (this.group) {
      extraValue[this.config.extraKey || DEFAULT_EXTRA_KEY] = this.group.value;
    }
    return merge({}, this.currentValue || {}, extraValue);
  }
}
