import {TemplateResult, html} from '@blinkk/selective-edit';
import {ContentSectionPart} from './section';
import {LiveEditor} from '../../editor';

export class MediaPart extends ContentSectionPart {
  get label() {
    return 'Media';
  }

  get section(): string {
    return 'media';
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`Media...`;
  }
}
