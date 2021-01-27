import {BasePart, Part} from '..';
import {TemplateResult, expandClasses, html} from '@blinkk/selective-edit';
import {EditorState} from '../../state';
import {LiveEditor} from '../../editor';
import {Storage} from '../../../utility/storage';

export const STORAGE_CONTENT_SECTION = 'live.content.section';

export interface ContentSectionPartConfig {
  /**
   * Is this section the default visible?
   */
  isDefaultSection?: boolean;
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  /**
   * Storage class for working with settings.
   */
  storage: Storage;
}

export class ContentSectionPart extends BasePart implements Part {
  config: ContentSectionPartConfig;
  isVisible?: boolean;

  constructor(config: ContentSectionPartConfig) {
    super();
    this.config = config;

    if (this.isVisible === undefined) {
      const currentSection = this.config.storage.getItem(
        STORAGE_CONTENT_SECTION
      );
      if (currentSection === null) {
        this.isVisible = this.config.isDefaultSection;
      } else {
        this.isVisible = this.section === currentSection;
      }
    }
  }

  classesForAction(): Array<string> {
    return ['le__button'];
  }

  classesForPart(): Array<string> {
    return ['le__part__content__section'];
  }

  handleAction(evt: Event) {
    console.log('missing action handler.');
  }

  get label() {
    return 'Section';
  }

  labelForAction() {
    return 'Save changes';
  }

  get section(): string {
    return 'section';
  }

  template(editor: LiveEditor): TemplateResult {
    if (!this.isVisible) {
      return html``;
    }

    return html`<div class=${expandClasses(this.classesForPart())}>
      ${this.templateContent(editor)}
    </div>`;
  }

  templateAction(editor: LiveEditor): TemplateResult {
    return html`<button
      class=${expandClasses(this.classesForAction())}
      @click=${this.handleAction.bind(this)}
    >
      ${this.labelForAction()}
    </button>`;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`section content`;
  }
}
