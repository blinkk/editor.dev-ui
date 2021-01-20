import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../editor';
import {Part} from '.';

export class PreviewPart implements Part {
  template(editor: LiveEditor): TemplateResult {
    return html`Preview`;
  }
}
