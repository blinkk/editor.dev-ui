import {BasePart, LazyUiParts, UiPartComponent, UiPartConfig} from '.';
import {EditorState, StatePromiseKeys} from '../state';
import {PreviewFramePart, PreviewFramePartConfig} from './preview/frame';
import {PreviewToolbarPart, PreviewToolbarPartConfig} from './preview/toolbar';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';

import {DataStorage} from '../../utility/dataStorage';
import {DeviceData} from '../api';
import {templateLoading} from '../template';

export interface PreviewPartConfig extends UiPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  /**
   * Storage class for working with settings.
   */
  storage: DataStorage;
}

export class PreviewPart extends BasePart implements UiPartComponent {
  config: PreviewPartConfig;
  device?: DeviceData;
  parts: LazyUiParts;

  constructor(config: PreviewPartConfig) {
    super();
    this.config = config;

    this.parts = new LazyUiParts();

    this.parts.register('frame', PreviewFramePart, {
      state: this.config.state,
      storage: this.config.storage,
    } as PreviewToolbarPartConfig);
    this.parts.register('toolbar', PreviewToolbarPart, {
      state: this.config.state,
      storage: this.config.storage,
    } as PreviewFramePartConfig);
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__panel: true,
      le__part__preview: true,
      'le__part__preview--device_mode':
        (this.partToolbar.isDeviceMode || false) &&
        Boolean(this.partToolbar.device),
    };
  }

  get isExpanded(): boolean {
    return this.partToolbar.isExpanded || false;
  }

  get partFrame(): PreviewFramePart {
    return this.parts.get('frame') as PreviewFramePart;
  }

  get partToolbar(): PreviewToolbarPart {
    return this.parts.get('toolbar') as PreviewToolbarPart;
  }

  template(): TemplateResult {
    const pieces: Array<TemplateResult> = [];

    pieces.push(this.partToolbar.template());

    if (this.config.state.file?.url) {
      pieces.push(
        this.partFrame.template(
          this.partToolbar.device,
          this.partToolbar.isRotated
        )
      );
    } else if (this.config.state.previewConfig === undefined) {
      pieces.push(this.templatePreviewConfigLoading());
    } else if (this.config.state.previewConfig === null) {
      pieces.push(this.templatePreviewNotConfigured());
    } else {
      pieces.push(this.templatePreviewNotAvailable());
    }

    return html`<div class=${classMap(this.classesForPart())}>${pieces}</div>`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templatePreviewConfigLoading(): TemplateResult {
    return templateLoading({}, html`<div>Searching for file preview.</div>`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templatePreviewNotAvailable(): TemplateResult {
    // When waiting for the file to load do not show anything
    // since the file load is already showing.
    if (this.config.editor.state.inProgress(StatePromiseKeys.GetFile)) {
      return html``;
    }

    return html`<div class="le__part__preview__message">
      <div>
        Unable to find a preview for
        <code>${this.config.state.file?.file.path}</code>.
      </div>
    </div>`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templatePreviewNotConfigured(): TemplateResult {
    // TODO: Link to the documentation on setting up a preview server.
    return html`<div class="le__part__preview__message">
      <div>
        No preview server configured or unable to load preview configuration.
      </div>
    </div>`;
  }
}
