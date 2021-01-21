import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../../..';
import {MenuSectionPart} from './index';

export class SitePart extends MenuSectionPart {
  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__menu__site');
    return classes;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`<div class="le__part__menu__section__content">
      <div class="le__list le__list--indent">
        <div class="le__list__item le__list__item--secondary">
          <div class="le__list__item__icon">
            <span class="material-icons">expand_more</span>
          </div>
          <div class="le__list__item__label">Collections</div>
        </div>
        <div class="le__list">
          <div class="le__list__item le__list__item--secondary">
            <div class="le__list__item__icon">
              <span class="material-icons">expand_more</span>
            </div>
            <div class="le__list__item__label">pages</div>
          </div>
          <div class="le__list">
            <div class="le__list__item le__list__item--primary le__clickable">
              <div class="le__list__item__icon">
                <span class="material-icons">add_circle</span>
              </div>
              <div class="le__list__item__label">New file</div>
            </div>
            <div class="le__list__item le__list__item--selected">
              <div class="le__list__item__icon">
                <span class="material-icons">notes</span>
              </div>
              <div class="le__list__item__label">index</div>
              <div class="le__actions le__actions--slim">
                <div
                  class="le__actions__action le__clickable le__tooltip--top"
                  data-tip="Duplicate file"
                >
                  <span class="material-icons">file_copy</span>
                </div>
                <div
                  class="le__actions__action le__actions__action--extreme le__clickable le__tooltip--top"
                  data-tip="Delete file"
                >
                  <span class="material-icons">remove_circle</span>
                </div>
              </div>
            </div>
            <div class="le__list__item">
              <div class="le__list__item__icon">
                <span class="material-icons">notes</span>
              </div>
              <div class="le__list__item__label">about</div>
              <div class="le__actions le__actions--slim">
                <div
                  class="le__actions__action le__clickable le__tooltip--top"
                  data-tip="Duplicate file"
                >
                  <span class="material-icons">file_copy</span>
                </div>
                <div
                  class="le__actions__action le__actions__action--extreme le__clickable le__tooltip--top"
                  data-tip="Delete file"
                >
                  <span class="material-icons">remove_circle</span>
                </div>
              </div>
            </div>
          </div>
          <div class="le__list__item le__list__item--secondary">
            <div class="le__list__item__icon">
              <span class="material-icons">chevron_right</span>
            </div>
            <div class="le__list__item__label">strings</div>
          </div>
        </div>
      </div>
    </div>`;
  }

  get title() {
    return 'Site';
  }
}
