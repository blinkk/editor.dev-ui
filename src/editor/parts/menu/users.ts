import {MenuSectionPart, MenuSectionPartConfig} from './index';
import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../../..';

export class UsersPart extends MenuSectionPart {
  constructor(config: MenuSectionPartConfig) {
    super(config);
    this.title = 'Users';
    // Need to wait for the correct title to be set before
    // loading from storage.
    this.loadFromStorage();
  }

  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('live_editor__part__menu__users');
    return classes;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`section content`;
  }
}
