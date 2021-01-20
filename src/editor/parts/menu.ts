import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../editor';
import {Part} from '.';

export class MenuPart implements Part {
  template(editor: LiveEditor): TemplateResult {
    return html`Menu`;
  }
}
