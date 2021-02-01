import {BasePart, Part} from '..';
import {TemplateResult, classMap, html, repeat} from '@blinkk/selective-edit';
import {DeviceData} from '../../api';
import {EditorState} from '../../state';
import {LiveEditor} from '../../editor';
import {Storage} from '../../../utility/storage';

const STORAGE_DEVICE_KEY = 'live.preview.device';
const STORAGE_DEVICE_MODE_KEY = 'live.preview.isDeviceMode';
const STORAGE_DEVICE_ROTATED_KEY = 'live.preview.isRotated';
const STORAGE_EXPANDED_KEY = 'live.preview.isExpanded';

export interface PreviewToolbarConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  /**
   * Storage class for working with settings.
   */
  storage: Storage;
}

export class PreviewToolbarPart extends BasePart implements Part {
  config: PreviewToolbarConfig;
  device?: DeviceData;
  isDeviceMode?: boolean;
  isExpanded?: boolean;
  isRotated?: boolean;

  constructor(config: PreviewToolbarConfig) {
    super();
    this.config = config;
    this.isDeviceMode = this.config.storage.getItemBoolean(
      STORAGE_DEVICE_MODE_KEY
    );
    this.isExpanded = this.config.storage.getItemBoolean(STORAGE_EXPANDED_KEY);
    this.isRotated = this.config.storage.getItemBoolean(
      STORAGE_DEVICE_ROTATED_KEY
    );
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__preview__toolbar: true,
    };
  }

  loadDevices() {
    this.config.state.getDevices((devices: Array<DeviceData>) => {
      // Check for matching device labels to stored device info.
      const storedDevice = this.config.storage.getItem(STORAGE_DEVICE_KEY);
      if (storedDevice) {
        for (const device of devices) {
          if (device.label === storedDevice) {
            this.device = device;
            this.render();
            break;
          }
        }
      }
    });
  }

  template(editor: LiveEditor): TemplateResult {
    // Lazy load the devices.
    const devices = this.config.state.devices;
    if (this.isDeviceMode && !devices) {
      this.loadDevices();
    }

    return html`<div class=${classMap(this.classesForPart())}>
      <div class="le__part__preview__toolbar__icons">
        ${this.templateIconExpanded(editor)}
      </div>
      ${this.isDeviceMode && (devices || []).length
        ? html`<div class="le__part__preview__toolbar__devices">
            ${repeat(
              devices || [],
              device => device.label,
              device => {
                return html`<div
                  class=${classMap({
                    le__clickable: true,
                    le__part__preview__toolbar__device: true,
                    'le__part__preview__toolbar__device--selected':
                      this.device === device,
                    'le__tooltip--top': true,
                  })}
                  data-tip="${device.width}${device.height
                    ? ` x ${device.height}`
                    : ''}"
                  @click=${() => {
                    this.device = device;
                    this.config.storage.setItem(
                      STORAGE_DEVICE_KEY,
                      device.label
                    );
                    this.render();
                  }}
                >
                  ${device.label}
                </div>`;
              }
            )}
          </div>`
        : html`<div class="le__part__preview__toolbar__label">Preview</div>`}
      <div class="le__part__preview__toolbar__icons">
        ${this.templateIconDeviceRotate(editor)}
        ${this.templateIconDeviceMode(editor)}
        ${this.templateIconBreakout(editor)}
      </div>
    </div>`;
  }

  templateIconBreakout(editor: LiveEditor): TemplateResult {
    if (!this.config.state.file?.url) {
      return html``;
    }

    return html`<div
      class="le__part__preview__toolbar__icon le__clickable le__tooltip--top-left"
      data-tip="Preview in new window"
      @click=${() => {
        // TODO: Open preview url in new window.
        window.open(this.config.state.file?.url, '_blank');
      }}
    >
      <span class="material-icons">open_in_new</span>
    </div>`;
  }

  templateIconExpanded(editor: LiveEditor): TemplateResult {
    return html`<div
      class="le__part__preview__toolbar__icon le__clickable le__tooltip--top"
      data-tip=${this.isExpanded ? 'Content and preview' : 'Preview only'}
      @click=${() => {
        this.isExpanded = !this.isExpanded;
        this.config.storage.setItemBoolean(
          STORAGE_EXPANDED_KEY,
          this.isExpanded
        );
        this.render();
      }}
    >
      <span class="material-icons"
        >${this.isExpanded ? 'fullscreen_exit' : 'fullscreen'}</span
      >
    </div>`;
  }

  templateIconDeviceMode(editor: LiveEditor): TemplateResult {
    return html`<div
      class=${classMap({
        le__part__preview__toolbar__icon: true,
        'le__part__preview__toolbar__icon--selected':
          this.isDeviceMode || false,
        le__clickable: true,
        'le__tooltip--top-left': true,
      })}
      data-tip=${this.isDeviceMode
        ? 'Turn off device mode'
        : 'Turn on device mode'}
      @click=${() => {
        this.isDeviceMode = !this.isDeviceMode;
        this.config.storage.setItemBoolean(
          STORAGE_DEVICE_MODE_KEY,
          this.isDeviceMode
        );
        // Remove the device information if exiting device mode.
        if (!this.isDeviceMode) {
          this.device = undefined;
        }
        this.render();
      }}
    >
      <span class="material-icons">devices</span>
    </div>`;
  }

  templateIconDeviceRotate(editor: LiveEditor): TemplateResult {
    const blockRotate = Boolean(
      !this.isDeviceMode || (this.device && !this.device.canRotate)
    );
    return html`<div
      class=${classMap({
        le__part__preview__toolbar__icon: true,
        'le__part__preview__toolbar__icon--disabled': blockRotate,
        'le__part__preview__toolbar__icon--selected': this.isRotated || false,
        le__clickable: true,
        'le__tooltip--top-left': true,
      })}
      data-tip="Rotate device view"
      @click=${() => {
        if (blockRotate) {
          return;
        }
        this.isRotated = !this.isRotated;
        this.config.storage.setItemBoolean(
          STORAGE_DEVICE_ROTATED_KEY,
          this.isRotated
        );
        this.render();
      }}
    >
      <span class="material-icons">screen_rotation</span>
    </div>`;
  }
}
