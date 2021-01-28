import {BasePart, Part} from '..';
import {ContentSectionPart, STORAGE_CONTENT_SECTION} from './section';
import {
  TemplateResult,
  classMap,
  expandClasses,
  html,
  repeat,
} from '@blinkk/selective-edit';
import {EditorState} from '../../state';
import {LiveEditor} from '../../editor';
import {Storage} from '../../../utility/storage';
import {templateLoading} from '../../template';

export interface ContentHeaderConfig {
  sections: Array<ContentSectionPart>;
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  storage: Storage;
}

export class ContentHeaderPart extends BasePart implements Part {
  config: ContentHeaderConfig;

  constructor(config: ContentHeaderConfig) {
    super();
    this.config = config;
  }

  classesForPart(): Array<string> {
    const classes = ['le__part__content__header'];
    return classes;
  }

  handleSectionClick(evt: Event, section: ContentSectionPart) {
    for (const sectionPart of this.config.sections) {
      sectionPart.isVisible = false;
    }
    this.config.storage.setItem(STORAGE_CONTENT_SECTION, section.section);
    section.isVisible = true;
    this.render();
  }

  template(editor: LiveEditor): TemplateResult {
    let currentSection: ContentSectionPart | undefined = undefined;
    for (const sectionPart of this.config.sections) {
      if (sectionPart.isVisible) {
        currentSection = sectionPart;
        break;
      }
    }

    return html`<div class=${expandClasses(this.classesForPart())}>
      <div class="le__part__content__header__sections">
        ${repeat(
          this.config.sections,
          section => section.section,
          section =>
            html`<div
              class=${classMap({
                le__part__content__header__section: true,
                le__clickable:
                  section.isVisible ||
                  currentSection?.canChangeSection ||
                  false,
                'le__part__content__header__section--selected':
                  section.isVisible || false,
                'le__part__content__header__section--disabled':
                  !section.isVisible && !currentSection?.canChangeSection,
              })}
              @click=${(evt: Event) => {
                // Block switching sections when
                if (!currentSection?.canChangeSection) {
                  return;
                }
                this.handleSectionClick(evt, section);
              }}
            >
              ${section.label}
            </div>`
        )}
      </div>
      <div class="le__part__content__header__actions">
        ${currentSection?.isProcessing ? html`${templateLoading(editor)}` : ''}
        ${currentSection?.templateStatus(editor) || html``}
        ${currentSection?.templateAction(editor) || html``}
      </div>
    </div>`;
  }
}
