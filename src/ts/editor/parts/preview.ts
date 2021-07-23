import {BasePart, Part} from '.';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';
import {DataStorage} from '../../utility/dataStorage';
import {DeviceData} from '../api';
import {EditorState, StatePromiseKeys} from '../state';
import {LiveEditor} from '../editor';
import {PreviewFramePart} from './preview/frame';
import {PreviewToolbarPart} from './preview/toolbar';
import {templateLoading} from '../template';

export interface PreviewPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  /**
   * Storage class for working with settings.
   */
  storage: DataStorage;
}

export interface PreviewParts {
  frame: PreviewFramePart;
  toolbar: PreviewToolbarPart;
}

export class PreviewPart extends BasePart implements Part {
  config: PreviewPartConfig;
  device?: DeviceData;
  parts: PreviewParts;

  constructor(config: PreviewPartConfig) {
    super();
    this.config = config;

    this.parts = {
      frame: new PreviewFramePart({
        state: this.config.state,
        storage: this.config.storage,
      }),
      toolbar: new PreviewToolbarPart({
        state: this.config.state,
        storage: this.config.storage,
      }),
    };
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__preview: true,
      'le__part__preview--device_mode':
        (this.parts.toolbar.isDeviceMode || false) &&
        Boolean(this.parts.toolbar.device),
    };
  }

  get isExpanded(): boolean {
    return this.parts.toolbar.isExpanded || false;
  }

  template(editor: LiveEditor): TemplateResult {
    const pieces: Array<TemplateResult> = [];

    pieces.push(this.parts.toolbar.template(editor));

    if (this.config.state.file?.url) {
      pieces.push(
        this.parts.frame.template(
          editor,
          this.parts.toolbar.device,
          this.parts.toolbar.isRotated
        )
      );
    } else if (this.config.state.previewConfig === undefined) {
      pieces.push(this.templatePreviewConfigLoading(editor));
    } else if (this.config.state.previewConfig === null) {
      pieces.push(this.templatePreviewNotConfigured(editor));
    } else {
      pieces.push(this.templatePreviewNotAvailable(editor));
    }

    return html`<div class=${classMap(this.classesForPart())}>${pieces}</div>`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templatePreviewConfigLoading(editor: LiveEditor): TemplateResult {
    return html`<div class="le__part__preview__message">
      ${templateLoading()}
      <div>Searching for file preview.</div>
    </div>`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  templatePreviewNotAvailable(editor: LiveEditor): TemplateResult {
    // When waiting for the file to load do not show anything
    // since the file load is already showing.
    if (editor.state.inProgress(StatePromiseKeys.GetFile)) {
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
  templatePreviewNotConfigured(editor: LiveEditor): TemplateResult {
    // TODO: Link to the documentation on setting up a preview server.
    return html`<div class="le__part__preview__message">
      <div>
        No preview server configured or unable to load preview configuration.
      </div>
    </div>`;
  }
}
