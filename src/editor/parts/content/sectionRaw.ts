import {TemplateResult, html} from '@blinkk/selective-edit';
import {ContentSectionPart} from './index';
import {LiveEditor} from '../../..';
import {UserData} from '../../api';

export class RawPart extends ContentSectionPart {
  users?: Array<UserData>;
  usersPromise?: Promise<Array<UserData>>;

  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__content__raw');
    return classes;
  }

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
