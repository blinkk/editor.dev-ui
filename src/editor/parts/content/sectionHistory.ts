import {TemplateResult, html} from '@blinkk/selective-edit';
import {ContentSectionPart} from './section';
import {LiveEditor} from '../../editor';
import {UserData} from '../../api';

export class HistoryPart extends ContentSectionPart {
  users?: Array<UserData>;
  usersPromise?: Promise<Array<UserData>>;

  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__content__history');
    return classes;
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
