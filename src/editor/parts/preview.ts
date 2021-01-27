import {BasePart, Part} from '.';
import {TemplateResult, expandClasses, html} from '@blinkk/selective-edit';
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

  classesForPart(): Array<string> {
    const classes = ['le__part__preview'];

    if (this.isDeviceMode) {
      classes.push('le__part__preview--device_mode');
    }

    return classes;
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

    return html`<div class=${expandClasses(this.classesForPart())}>
      <div class="le__part__preview__toolbar"></div>
      <div class="le__part__preview__container">
        <div class="le__part__preview__frame">
          <iframe src="preview.html"></iframe>
        </div>
      </div>
    </div>`;
  }
}
