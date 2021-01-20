import {BasePart, Part} from '..';
import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../../..';

export class WorkspacesPart extends BasePart implements Part {
  template(editor: LiveEditor): TemplateResult {
    return html`Workspaces.`;
  }
}
