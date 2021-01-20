import {BasePart, Part} from '.';
import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../editor';

export class PreviewPart extends BasePart implements Part {
  template(editor: LiveEditor): TemplateResult {
    return html`<div>Preview</div>`;
  }
}
