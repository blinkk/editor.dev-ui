import {BasePart, Part} from '.';
import {TemplateResult, html} from '@blinkk/selective-edit';
import {LiveEditor} from '../editor';

export class ContentPart extends BasePart implements Part {
  template(editor: LiveEditor): TemplateResult {
    return html`<div>Content</div>`;
  }
}
