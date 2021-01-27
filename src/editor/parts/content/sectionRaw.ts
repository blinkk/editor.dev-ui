import {TemplateResult, html} from '@blinkk/selective-edit';
import {ContentSectionPart} from './section';
import {LiveEditor} from '../../editor';

export class RawPart extends ContentSectionPart {
  classesForAction(): Array<string> {
    const classes = super.classesForAction();

    // TODO: Base the button classes on the form status.
    classes.push('le__button--primary');

    return classes;
  }

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
