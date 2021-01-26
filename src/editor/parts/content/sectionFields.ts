import {TemplateResult, html} from '@blinkk/selective-edit';
import {ContentSectionPart} from './index';
import {LiveEditor} from '../../..';
import {UserData} from '../../api';

export class FieldsPart extends ContentSectionPart {
  users?: Array<UserData>;
  usersPromise?: Promise<Array<UserData>>;

  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__content__fields');
    return classes;
  }

  get label() {
    return 'Fields';
  }

  get section(): string {
    return 'fields';
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`Fields...`;
  }
}
