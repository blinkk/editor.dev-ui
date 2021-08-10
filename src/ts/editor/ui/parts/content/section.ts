import {BasePart, UiPartComponent, UiPartConfig} from '..';
import {
  EditorConfig,
  SelectiveEditor,
  TemplateResult,
  classMap,
  html,
} from '@blinkk/selective-edit';
import {EditorState, StatePromiseKeys} from '../../../../editor/state';
import {
  LiveEditorSelectiveEditorConfig,
  cloneSelectiveConfig,
} from '../../../editor';
import {
  ProjectTypeComponent,
  updateSelectiveForProjectType,
} from '../../../../projectType/projectType';

import {DataStorage} from '../../../../utility/dataStorage';
import {LiveEditorAutoFields} from '../../../autoFields';

export const STORAGE_CONTENT_SECTION = 'live.content.section';

export interface ContentSectionPartConfig extends UiPartConfig {
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
  storage: DataStorage;
}

export class ContentSectionPart extends BasePart implements UiPartComponent {
  config: ContentSectionPartConfig;
  isProcessing?: boolean;
  isVisible?: boolean;
  selective: SelectiveEditor;

  constructor(config: ContentSectionPartConfig) {
    super();
    this.config = config;
    this.selective = new SelectiveEditor(
      // Clone to prevent shared values if editor changes config.
      cloneSelectiveConfig(
        this.config.selectiveConfig as LiveEditorSelectiveEditorConfig
      )
    );

    // Override the autofields class.
    this.selective.types.globals.AutoFieldsCls = LiveEditorAutoFields;

    // When the project type is updated the selective editor changes.
    this.config.state.addListener(
      StatePromiseKeys.SetProjectType,
      (projectType: ProjectTypeComponent) => {
        updateSelectiveForProjectType(projectType, this.selective);
        this.render();
      }
    );

    if (this.config.state.projectType) {
      updateSelectiveForProjectType(
        this.config.state.projectType,
        this.selective
      );
      this.render();
    }

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

    // Show a message when there are pending changes and navigating.
    window.addEventListener('beforeunload', (evt: BeforeUnloadEvent) => {
      if (!this.selective.isClean) {
        evt.preventDefault();
        evt.returnValue = '';
      }
    });
  }

  get canChangeSection(): boolean {
    return this.selective.isClean;
  }

  classesForAction(): Record<string, boolean> {
    return {
      le__part__content__header__action: true,
      le__button: true,
      'le__button--extreme': !this.selective.isValid,
    };
  }

  classesForPart(): Record<string, boolean> {
    const classes: Record<string, boolean> = {
      le__part__content__section: true,
    };
    classes[`le__part__content__${this.section}`] = true;
    return classes;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      return (
        this.config.editor.config.labels?.contentSaveProcessing || 'Saving'
      );
    } else if (!this.selective.isValid) {
      return (
        this.config.editor.config.labels?.contentSaveErrors || 'Form errors'
      );
    } else if (this.selective.isClean) {
      return this.config.editor.config.labels?.contentSaveClean || 'No changes';
    }

    return this.config.editor.config.labels?.contentSave || 'Save';
  }

  get section(): string {
    return 'section';
  }

  template(): TemplateResult {
    if (!this.isVisible) {
      return html``;
    }

    return html`<div class=${classMap(this.classesForPart())}>
      ${this.templateContent()}
    </div>`;
  }

  templateAction(): TemplateResult {
    return html`<button
      class=${classMap(this.classesForAction())}
      @click=${this.handleAction.bind(this)}
      ?disabled=${this.isActionDisabled}
    >
      ${this.labelForAction()}
    </button>`;
  }

  templateContent(): TemplateResult {
    return html`section content`;
  }

  templateStatus(): TemplateResult {
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
