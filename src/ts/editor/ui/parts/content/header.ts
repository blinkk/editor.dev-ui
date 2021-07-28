import {BasePart, LazyUiParts, UiPartComponent, UiPartConfig} from '..';
import {ContentSectionPart, STORAGE_CONTENT_SECTION} from './section';
import {TemplateResult, classMap, html, repeat} from '@blinkk/selective-edit';

import {CONTENT_SECTION_ORDER} from '../content';
import {DataStorage} from '../../../../utility/dataStorage';
import {EditorState} from '../../../state';
import {templateLoading} from '../../../template';

export interface ContentHeaderConfig extends UiPartConfig {
  sections: LazyUiParts;
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  storage: DataStorage;
}

export class ContentHeaderPart extends BasePart implements UiPartComponent {
  config: ContentHeaderConfig;

  constructor(config: ContentHeaderConfig) {
    super();
    this.config = config;
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__content__header: true,
    };
  }

  handleSectionClick(evt: Event, section: ContentSectionPart) {
    for (const sectionKey of CONTENT_SECTION_ORDER) {
      (this.config.sections.get(sectionKey) as ContentSectionPart).isVisible =
        false;
    }
    this.config.storage.setItem(STORAGE_CONTENT_SECTION, section.section);
    section.isVisible = true;
    this.render();
  }

  template(): TemplateResult {
    let currentSection: ContentSectionPart | undefined = undefined;
    const visibleSections: Array<ContentSectionPart> = [];
    for (const sectionKey of CONTENT_SECTION_ORDER) {
      const section: ContentSectionPart = this.config.sections.get(
        sectionKey
      ) as ContentSectionPart;
      visibleSections.push(section);
      if (section.isVisible) {
        currentSection = section;
      }
    }

    return html`<div class=${classMap(this.classesForPart())}>
      <div class="le__part__content__header__sections">
        ${repeat(
          visibleSections,
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
        ${currentSection?.isProcessing ? html`${templateLoading()}` : ''}
        ${currentSection?.templateStatus() || html``}
        ${currentSection?.templateAction() || html``}
      </div>
    </div>`;
  }
}
