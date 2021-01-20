import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../editor';
import {Part} from '.';

export class ContentPart implements Part {
  template(editor: LiveEditor): TemplateResult {
    return html`Content`;
  }
}
