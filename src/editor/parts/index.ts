import {EVENT_RENDER} from '../events';
import {LiveTemplate} from '../template';

export interface Part {
  render: () => void;
  template: LiveTemplate;
}

export abstract class BasePart {
  /**
   * Signal for the editor to re-render.
   */
  render() {
    document.dispatchEvent(new CustomEvent(EVENT_RENDER));
  }
}
