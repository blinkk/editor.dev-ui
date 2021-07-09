import {BasePart, Part} from '.';
import {EditorState, StatePromiseKeys} from '../state';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';

import {LiveEditor} from '../editor';
import {templateLoading} from '../template';

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
      'le__part__empty--loading': this.config.state.inProgress(
        StatePromiseKeys.GetFile
      ),
    };
  }

  template(editor: LiveEditor): TemplateResult {
    const subParts: Array<TemplateResult> = [];
    if (editor.state.inProgress(StatePromiseKeys.GetFile)) {
      subParts.push(html`<div class="le__part__empty__loading">
        ${templateLoading()} Loading
        <code>${editor.state.loadingFilePath || 'file'}</code>...
      </div>`);
    } else {
      subParts.push(html`Select a file from the menu to begin editing.`);
    }
    return html`<div class=${classMap(this.classesForPart())}>
      ${subParts}
    </div>`;
  }
}
