import {
  DeepObject,
  DroppableMixin,
  Field,
  FieldComponent,
  FieldConfig,
  SelectiveEditor,
  TemplateResult,
  Types,
  classMap,
  html,
} from '@blinkk/selective-edit';
import {EVENT_RENDER_COMPLETE} from '../events';
import {LiveEditorGlobalConfig} from '../editor';
import merge from 'lodash.merge';
import {reduceFraction} from '../../utility/math';
import {templateLoading} from '../template';

export const EXT_TO_MIME_TYPE: Record<string, string> = {
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
   * Placeholder for the text input.
   */
  placeholder?: string;
}

export interface MediaFieldComponent extends FieldComponent {
  handleFiles(files: Array<File>): void;
}

export interface MediaMeta {
  height: number;
  width: number;
}

export class MediaField
  extends DroppableMixin(Field)
  implements MediaFieldComponent {
  config: MediaFieldConfig;
  globalConfig: LiveEditorGlobalConfig;
  isProcessing?: boolean;
  meta?: MediaMeta;
  showFileUpload?: boolean;

  constructor(
    types: Types,
    config: MediaFieldConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'image'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
    this.globalConfig = globalConfig;
    this.droppableUi.validTypes = [
      ...VALID_IMAGE_MIME_TYPES,
      ...VALID_VIDEO_MIME_TYPES,
    ];
    this.droppableUi.listeners.add('files', this.handleFiles.bind(this));
  }

  /**
   * Retrieve the url for previewing the field.
   */
  get previewUrl(): string | undefined {
    const value = this.currentValue || {};
    if (value && value.url) {
      return value.url;
    }

    if (value && value.path) {
      if (
        value.path.startsWith('http:') ||
        value.path.startsWith('https:') ||
        value.path.startsWith('//')
      ) {
        return value.path;
      }
    }

    // TODO: Use api to get the preview url for the file path.

    return undefined;
  }

  handleFiles(files: Array<File>) {
    this.isProcessing = true;
    this.render();

    // Uploads only the first file.
    this.globalConfig.api.uploadFile(files[0]).then(file => {
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

    actions.push(html`<div
      class="selective__action"
      @click=${() => {
        this.showFileUpload = true;
        document.addEventListener(
          EVENT_RENDER_COMPLETE,
          () => {
            (document.querySelector(
              `#media-file-${this.uid}`
            ) as HTMLElement).click();
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
        <div class=${classMap(this.classesForInput())}>
          <input
            type="text"
            id="media-${this.uid}"
            placeholder=${this.config.placeholder || ''}
            @input=${this.handleInput.bind(this)}
            value=${value.url || ''}
          />
          ${this.isProcessing
            ? html`${templateLoading(editor, {padHorizontal: true})}`
            : ''}
          <div class="selective__field__actions">${actions}</div>
        </div>
        ${this.templateFileUpload(editor, data)}
        ${this.templatePreview(editor, data)}
      </div>
      ${this.templateErrors(editor, data)}`;
  }

  templatePreview(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    const url = this.previewUrl;
    if (!url) {
      return html``;
    }

    return html`<div class="selective__media__preview">
      <div class="selective__media__preview_media">
        <div class="selective__media__preview_media__label">Media preview</div>
        ${this.templatePreviewMedia(editor, data)}
      </div>
      <div class="selective__media__meta">
        ${this.templatePreviewMeta(editor, data)}
      </div>
    </div>`;
  }

  templatePreviewMedia(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    editor: SelectiveEditor,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: DeepObject
  ): TemplateResult {
    const url = this.previewUrl;
    if (!url) {
      return html``;
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
}
