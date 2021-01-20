import {EVENT_RENDER} from '../events';
import {LiveTemplate} from '../template';

export interface UI {
  render: () => void;
  template: LiveTemplate;
}

export class BaseUI {
  /**
   * Signal for the editor to re-render.
   */
  render() {
    document.dispatchEvent(new CustomEvent(EVENT_RENDER));
  }
}
