import {BasePart, Part} from '.';
import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../editor';
import {expandClasses} from '@blinkk/selective-edit/dist/src/utility/dom';

export class OverviewPart extends BasePart implements Part {
  classesForPart(): Array<string> {
    return ['live_editor__part__overview'];
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${expandClasses(this.classesForPart())}>
      ${this.templateMenu(editor)}
      <div class="live_editor__part__overview__title">Overview</div>
      ${this.templateWorkspace(editor)}
    </div>`;
  }

  templateMenu(editor: LiveEditor): TemplateResult {
    if (editor.parts.menu.isDocked) {
      return html``;
    }

    return html`<div class="live_editor__part__overview__menu">
      <span class="material-icons">menu</span>
    </div>`;
  }

  templateWorkspace(editor: LiveEditor): TemplateResult {
    return html`<div class="live_editor__part__overview__workspace">
      <span>Workspace:</span>
      <strong>...branch...</strong> @ <strong>...hash...</strong> by
      <strong>...name...</strong> (time ago)
    </div>`;
  }
}
