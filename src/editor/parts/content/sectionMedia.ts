import {TemplateResult, html} from '@blinkk/selective-edit';
import {ContentSectionPart} from './section';
import {LiveEditor} from '../../editor';

export class MediaPart extends ContentSectionPart {
  classesForAction(): Array<string> {
    const classes = super.classesForAction();

    // TODO: Base the button classes on the form status.
    classes.push('le__button--primary');

    return classes;
  }

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
