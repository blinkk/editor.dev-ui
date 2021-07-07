import {BasePart, Part} from '..';
import {TemplateResult, classMap, html, styleMap} from '@blinkk/selective-edit';
import {DataStorage} from '../../../utility/dataStorage';
import {DeviceData} from '../../api';
import {EditorState} from '../../state';
import {LiveEditor} from '../../editor';

/**
 * Size of buffer to place around the preview frame so it does not
 * bump directly against the edge of the container.
 */
const BUFFER_SIZE = 20;

export interface PreviewFrameConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  /**
   * Storage class for working with settings.
   */
  storage: DataStorage;
}

interface ContainerSize {
  height: number;
  width: number;
}

interface FrameSize {
  height?: number;
  width?: number;
  scale: number;
}

export class PreviewFramePart extends BasePart implements Part {
  config: PreviewFrameConfig;
  container?: HTMLElement;

  constructor(config: PreviewFrameConfig) {
    super();
    this.config = config;
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__preview__container: true,
    };
  }

  /**
   * Get the size of the container so that the device preview can be
   * scaled correctly with the size of the preview area.
   *
   * This is really hacky, but unknown if there is a different way in
   * lit-html to get the size of parent element.
   */
  getIframeSize(device?: DeviceData, isRotated?: boolean): FrameSize {
    if (!device) {
      return {
        scale: 1,
      };
    }

    const container = document.querySelector('.le__part__preview__container');
    if (!container) {
      return {
        scale: 1,
      };
    }

    const deviceSize: ContainerSize = {
      height:
        (device.canRotate && isRotated ? device.width : device.height) || -1,
      width:
        (device.canRotate && isRotated ? device.height : device.width) || -1,
    };
    const containerSize: ContainerSize = {
      height: container.clientHeight,
      width: container.clientWidth,
    };

    // Special case of not having a set height. Need to change the adjust the
    // height of the iframe to keep the correct ratio.
    if (!device.height) {
      // Normally the height is the 'undefined' value, but if the device allows
      // rotation then the width will be the 'undefined' value.
      if (deviceSize.height === -1) {
        deviceSize.height =
          (deviceSize.width * containerSize.height) / containerSize.width;
      } else {
        deviceSize.width =
          (deviceSize.height * containerSize.width) / containerSize.height;
      }
    }

    // A device size that fits completely in the preview container.
    // Do not need to scale.
    if (
      deviceSize.height <= containerSize.height &&
      deviceSize.width <= containerSize.width
    ) {
      return {
        height: deviceSize.height,
        scale: 1,
        width: deviceSize.width,
      };
    }

    // When there is no height for the device, do not use a buffer.
    // This gives a 'chromeless' zoomed out look without the
    // drop-shadow/device look.
    const bufferSize = device.height ? BUFFER_SIZE : 0;

    const heightRatio = containerSize.height / (deviceSize.height + bufferSize);
    const widthRatio = containerSize.width / (deviceSize.width + bufferSize);

    // The ratios to determine which dimension overflows from the container
    // the most. The smaller value hits the edge of the container first, so
    // scale for that dimension.
    return {
      height: deviceSize.height,
      width: deviceSize.width,
      scale: Math.min(heightRatio, widthRatio),
    };
  }

  template(
    editor: LiveEditor,
    device?: DeviceData,
    isRotated?: boolean
  ): TemplateResult {
    const sizing = this.getIframeSize(device, isRotated);

    console.log(this.config.state.project);

    return html`<div class=${classMap(this.classesForPart())}>
      <div
        class=${classMap({
          le__part__preview__frame: true,
          'le__part__preview__frame--unbounded': Boolean(
            device && !device.height
          ),
        })}
        style=${styleMap({
          'max-height': sizing.height
            ? `${sizing.height * sizing.scale}px`
            : 'none',
          'max-width': sizing.width
            ? `${sizing.width * sizing.scale}px`
            : 'none',
        })}
      >
        <iframe
          src=${this.config.state.file?.url || ''}
          style=${styleMap({
            'min-height': sizing.height ? `${sizing.height}px` : 'none',
            width: sizing.width ? `${sizing.width}px` : 'auto',
            transform: `scale(${sizing.scale})`,
          })}
        ></iframe>
      </div>
    </div>`;
  }
}
