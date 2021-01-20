import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../../..';
import {MenuSectionPart} from './index';

export class SitePart extends MenuSectionPart {
  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('live_editor__part__menu__site');
    return classes;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`section content`;
  }
}
