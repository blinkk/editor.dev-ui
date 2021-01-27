import {TemplateResult, html} from '@blinkk/selective-edit';
import {ContentSectionPart} from './section';
import {LiveEditor} from '../../editor';
import {UserData} from '../../api';

export class FieldsPart extends ContentSectionPart {
  users?: Array<UserData>;
  usersPromise?: Promise<Array<UserData>>;

  classesForAction(): Array<string> {
    const classes = super.classesForAction();

    // TODO: Base the button classes on the form status.
    classes.push('le__button--primary');

    return classes;
  }

  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__content__fields');
    return classes;
  }

  get label() {
    return 'Fields';
  }

  labelForAction() {
    // TODO: Base label on the state of the form.
    return 'Save changes';
  }

  get section(): string {
    return 'fields';
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`Fields...`;
  }
}
