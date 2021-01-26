import {TemplateResult, html} from '@blinkk/selective-edit';
import {ContentSectionPart} from './index';
import {LiveEditor} from '../../..';
import {UserData} from '../../api';

export class MediaPart extends ContentSectionPart {
  users?: Array<UserData>;
  usersPromise?: Promise<Array<UserData>>;

  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__content__media');
    return classes;
  }

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
