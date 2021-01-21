import {MenuSectionPart, MenuSectionPartConfig} from './index';
import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../../..';

export class SitePart extends MenuSectionPart {
  constructor(config: MenuSectionPartConfig) {
    super(config);
    this.title = 'Site';
    // Need to wait for the correct title to be set before
    // loading from storage.
    this.loadFromStorage();
  }

  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__menu__site');
    return classes;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`<div class="le__part__menu__section__content">Site</div>`;
  }
}
