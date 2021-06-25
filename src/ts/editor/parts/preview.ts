import {BasePart, Part} from '.';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';
import {DataStorage} from '../../utility/dataStorage';
import {DeviceData} from '../api';
import {EditorState} from '../state';
import {LiveEditor} from '../editor';
import {PreviewFramePart} from './preview/frame';
import {PreviewToolbarPart} from './preview/toolbar';

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
    return html`<div class=${classMap(this.classesForPart())}>
      ${this.parts.toolbar.template(editor)}
      ${this.parts.frame.template(
        editor,
        this.parts.toolbar.device,
        this.parts.toolbar.isRotated
      )}
    </div>`;
  }
}
