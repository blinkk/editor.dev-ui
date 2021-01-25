import {BasePart, Part} from '.';
import {DeviceData, LiveEditorApiComponent, catchError} from '../api';
import {TemplateResult, expandClasses, html} from '@blinkk/selective-edit';
import {LiveEditor} from '../editor';
import {Storage} from '../../utility/storage';

const STORAGE_DEVICE_MODE_KEY = 'live.preview.isDeviceMode';

export interface PreviewPartConfig {
  /**
   * API for retrieving data for the editor.
   */
  api: LiveEditorApiComponent;
  /**
   * Storage class for working with settings.
   */
  storage: Storage;
}

export class PreviewPart extends BasePart implements Part {
  config: PreviewPartConfig;
  device?: DeviceData;
  devices?: Array<DeviceData>;
  devicesPromise?: Promise<Array<DeviceData>>;
  isDeviceMode?: boolean;

  constructor(config: PreviewPartConfig) {
    super();
    this.config = config;

    this.isDeviceMode = this.config.storage.getItemBoolean(
      STORAGE_DEVICE_MODE_KEY,
      true
    );

    this.loadDevices();
  }

  classesForPart(): Array<string> {
    const classes = ['le__part__preview'];

    if (this.isDeviceMode) {
      classes.push('le__part__preview--device_mode');
    }

    return classes;
  }

  loadDevices() {
    if (this.devicesPromise) {
      return;
    }
    this.devicesPromise = this.config.api.getDevices();
    this.devicesPromise
      .then(data => {
        this.devices = data;
        this.devicesPromise = undefined;
        this.render();
      })
      .catch(catchError);
  }

  template(editor: LiveEditor): TemplateResult {
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
