import {BasePart, Part} from '..';
import {
  EditorConfig,
  SelectiveEditor,
  TemplateResult,
  classMap,
  expandClasses,
  html,
} from '@blinkk/selective-edit';
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
   * Configuration for creating the selective editor.
   */
  selectiveConfig: EditorConfig;
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
  isProcessing?: boolean;
  isVisible?: boolean;
  selective: SelectiveEditor;

  constructor(config: ContentSectionPartConfig) {
    super();
    this.config = config;
    this.selective = new SelectiveEditor(this.config.selectiveConfig);

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

  get canChangeSection(): boolean {
    return this.selective.isClean;
  }

  classesForAction(): Array<string> {
    const classes = ['le__part__content__header__action', 'le__button'];

    // Base the button classes on the form status.
    if (!this.selective.isValid) {
      classes.push('le__button--extreme');
    } else {
      classes.push('le__button--primary');
    }

    return classes;
  }

  classesForPart(): Array<string> {
    return ['le__part__content__section'];
  }

  handleAction(evt: Event) {
    console.log('missing action handler.');
  }

  get isActionDisabled(): boolean {
    return (
      this.isProcessing || !this.selective.isValid || this.selective.isClean
    );
  }

  get label(): string {
    return 'Section';
  }

  labelForAction(): string {
    if (this.isProcessing) {
      return 'Saving';
    } else if (!this.selective.isValid) {
      return 'Form errors';
    } else if (this.selective.isClean) {
      return 'No changes';
    }

    return 'Save';
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
      ?disabled=${this.isActionDisabled}
    >
      ${this.labelForAction()}
    </button>`;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    return html`section content`;
  }

  templateStatus(editor: LiveEditor): TemplateResult {
    if (!this.selective.isValid) {
      return html`<div
        class=${classMap({
          le__part__content__header__status: true,
          'le__part__content__header__status--error': true,
          'le__tooltip--top': true,
        })}
        data-tip="Form errors"
      >
        <span class="material-icons">error</span>
      </div>`;
    }
    return html``;
  }
}
