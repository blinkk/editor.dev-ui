import {BasePart, Part} from '.';
import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../editor';
import {expandClasses} from '@blinkk/selective-edit/dist/src/utility/dom';

export class OverviewPart extends BasePart implements Part {
  classesForPart(): Array<string> {
    return ['le__part__overview'];
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${expandClasses(this.classesForPart())}>
      ${this.templateMenu(editor)} ${this.templateProject(editor)}
      ${this.templateWorkspace(editor)}
    </div>`;
  }

  templateMenu(editor: LiveEditor): TemplateResult {
    if (editor.parts.menu.isDocked) {
      return html``;
    }

    const handleMenuClick = () => {
      editor.parts.menu.toggle();
    };

    return html`<div
      class="le__part__overview__menu le__clickable"
      @click=${handleMenuClick}
    >
      <span class="material-icons">menu</span>
    </div>`;
  }

  templateProject(editor: LiveEditor): TemplateResult {
    let projectName = html`...Project name...`;

    // Menu shows the project name when it is docked.
    if (editor.parts.menu.isDocked) {
      projectName = html`&nbsp;`;
    }

    return html`<div class="le__part__overview__title">${projectName}</div>`;
  }

  templateWorkspace(editor: LiveEditor): TemplateResult {
    return html`<div class="le__part__overview__workspace">
      <span>Workspace:</span>
      <strong>...branch...</strong> @ <strong>...hash...</strong> by
      <strong>...name...</strong> (time ago)
    </div>`;
  }
}
