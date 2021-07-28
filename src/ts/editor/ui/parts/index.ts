import {EVENT_RENDER} from '../../events';
import {LiveEditor} from '../../editor';
import {LiveTemplate} from '../../template';

export abstract class BasePart {
  /**
   * Signal for the editor to re-render.
   */
  render() {
    document.dispatchEvent(new CustomEvent(EVENT_RENDER));
  }
}

export interface UiPartComponent {
  render: () => void;
  template: LiveTemplate;
}

export interface UiPartConfig {
  /**
   * Editor.
   */
  editor: LiveEditor;
}

export interface UiPartConstructor {
  // Using the UiPartConfig causes compiler issues.
  new (config: any): UiPartComponent;
}

type LazyUiPartInfo = {
  cls: UiPartConstructor;
  config: UiPartConfig;
};

/**
 * Lazy UI parts
 *
 * To save load time and un-used UI components the creation of the
 * parts can be delayed until they are needed.
 *
 * A part is registered with the configuration needed to create the
 * part. The first time that the part is requested the singleton
 * is requested for the part.
 */
export class LazyUiParts {
  parts: Record<string, UiPartComponent>;
  registry: Record<string, LazyUiPartInfo>;

  constructor() {
    this.parts = {};
    this.registry = {};
  }

  /**
   * Lazily get a part component.
   *
   * @param part Part name
   * @returns Part component singleton
   */
  get(part: string): UiPartComponent {
    if (!this.parts[part]) {
      const info = this.registry[part];

      if (!info) {
        throw new Error(`Missing part registration for: ${part}`);
      }

      this.parts[part] = new info.cls(info.config);
    }

    return this.parts[part];
  }

  /**
   * Determine if the part has already been instantiated.
   */
  has(part: string): boolean {
    return this.parts[part] !== undefined;
  }

  register(part: string, cls: UiPartConstructor, config: UiPartConfig) {
    this.registry[part] = {
      cls: cls,
      config: config,
    };
  }
}
