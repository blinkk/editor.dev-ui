import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../editor';
import {Part} from '.';

export class OverviewPart implements Part {
  template(editor: LiveEditor): TemplateResult {
    return html`Overview`;
  }
}
