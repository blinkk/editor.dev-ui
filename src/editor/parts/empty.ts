import {BasePart, Part} from '.';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';
import {EditorState} from '../state';
import {LiveEditor} from '../editor';

export interface EmptyPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
}

export class EmptyPart extends BasePart implements Part {
  config: EmptyPartConfig;

  constructor(config: EmptyPartConfig) {
    super();
    this.config = config;
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__empty: true,
    };
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${classMap(this.classesForPart())}>
      Select a file from the menu to begin editing.
    </div>`;
  }
}
