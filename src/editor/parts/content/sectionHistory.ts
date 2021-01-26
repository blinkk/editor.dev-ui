import {TemplateResult, html} from '@blinkk/selective-edit';
import {ContentSectionPart} from './index';
import {LiveEditor} from '../../..';
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

  templateContent(editor: LiveEditor): TemplateResult {
    return html`History...`;
  }
}
