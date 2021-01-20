import {BasePart, Part} from '..';
import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../../..';

export class SitePart extends BasePart implements Part {
  template(editor: LiveEditor): TemplateResult {
    return html`Site.`;
  }
}
