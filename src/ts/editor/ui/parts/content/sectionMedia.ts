import {TemplateResult, html} from '@blinkk/selective-edit';
import {ContentSectionPart} from './section';

export class MediaPart extends ContentSectionPart {
  get label() {
    return 'Media';
  }

  get section(): string {
    return 'media';
  }

  templateContent(): TemplateResult {
    return html`Media...`;
  }
}
