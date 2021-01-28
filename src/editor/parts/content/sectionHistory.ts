import {TemplateResult, html} from '@blinkk/selective-edit';
import {ContentSectionPart} from './section';
import {LiveEditor} from '../../editor';

export class HistoryPart extends ContentSectionPart {
  get canChangeSection(): boolean {
    return true;
  }

  get label() {
    return 'History';
  }

  get section(): string {
    return 'history';
  }

  templateAction(editor: LiveEditor): TemplateResult {
    return html``;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`History...`;
  }
}
