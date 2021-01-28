import {BasePart, Part} from '.';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';
import {DeviceData} from '../api';
import {EditorState} from '../state';
import {LiveEditor} from '../editor';
import {Storage} from '../../utility/storage';

const STORAGE_DEVICE_MODE_KEY = 'live.preview.isDeviceMode';

export interface PreviewPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  /**
   * Storage class for working with settings.
   */
  storage: Storage;
}

export class PreviewPart extends BasePart implements Part {
  config: PreviewPartConfig;
  device?: DeviceData;
  isDeviceMode?: boolean;
  isExpanded?: boolean;

  constructor(config: PreviewPartConfig) {
    super();
    this.config = config;

    this.isDeviceMode = this.config.storage.getItemBoolean(
      STORAGE_DEVICE_MODE_KEY,
      true
    );
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__preview: true,
      'le__part__preview--device_mode': this.isDeviceMode || false,
    };
  }

  loadDevices() {
    this.config.state.getDevices();
  }

  template(editor: LiveEditor): TemplateResult {
    const devices = this.config.state.devices;

    // Lazy load the devices.
    if (!devices) {
      this.loadDevices();
    }

    return html`<div class=${classMap(this.classesForPart())}>
      <div class="le__part__preview__toolbar"></div>
      <div class="le__part__preview__container">
        <div class="le__part__preview__frame">
          <iframe src="preview.html"></iframe>
        </div>
      </div>
    </div>`;
  }
}
