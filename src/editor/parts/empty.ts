import {BasePart, Part} from '.';
import {TemplateResult, expandClasses, html} from '@blinkk/selective-edit';
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

  classesForPart(): Array<string> {
    const classes = ['le__part__empty'];
    return classes;
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${expandClasses(this.classesForPart())}>
      Select a file from the menu to begin editing.
    </div>`;
  }
}
