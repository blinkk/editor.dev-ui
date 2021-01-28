import {TemplateResult, html} from '@blinkk/selective-edit';
import {ContentSectionPart} from './section';
import {LiveEditor} from '../../editor';

export class RawPart extends ContentSectionPart {
  get label() {
    return 'Raw';
  }

  get section(): string {
    return 'raw';
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`Raw...`;
  }
}
