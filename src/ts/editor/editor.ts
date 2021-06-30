import {DataStorage, LocalDataStorage} from '../utility/dataStorage';
import {
  EVENT_PROJECT_TYPE_UPDATE,
  EVENT_RENDER,
  EVENT_RENDER_COMPLETE,
  EVENT_SAVE,
} from './events';
import {
  EditorConfig,
  GlobalConfig,
  TemplateResult,
  classMap,
  html,
  render,
} from '@blinkk/selective-edit';
import {LiveEditorApiComponent, ProjectTypes} from './api';
import {AmagakiProjectType} from '../projectType/amagaki/amagakiProjectType';
import {ContentPart} from './parts/content';
import {EditorState} from './state';
import {EmptyPart} from './parts/empty';
import {GrowProjectType} from '../projectType/grow/growProjectType';
import {MenuPart} from './parts/menu';
import {ModalsPart} from './parts/modals';
import {NotificationsPart} from './parts/notifications';
import {OverviewPart} from './parts/overview';
import {PreviewPart} from './parts/preview';
import {ProjectTypeComponent} from '../projectType/projectType';
import {EVENT_RENDER as SELECTIVE_EVENT_RENDER} from '@blinkk/selective-edit/dist/selective/events';
import TimeAgo from 'javascript-time-ago';
import {ToastsPart} from './parts/toasts';
import en from 'javascript-time-ago/locale/en';

// Set the default locale for the time ago globally.
TimeAgo.addDefaultLocale(en);

/**
 * Global configuration used by the selective editor fields.
 *
 * Allows the fields to access the api.
 */
export interface LiveEditorGlobalConfig extends GlobalConfig {
  api: LiveEditorApiComponent;
  editor?: LiveEditor;
  labels: LiveEditorLabels;
  state: EditorState;
}

/**
 * Custom selective editor config.
 *
 * Customized to use the live editor global config interface.
 */
export interface LiveEditorSelectiveEditorConfig extends EditorConfig {
  global?: LiveEditorGlobalConfig;
}

/**
 * Configuration for the live editor.
 */
export interface LiveEditorConfig {
  /**
   * Api for working with the live editor project.
   */
  api: LiveEditorApiComponent;
  /**
   * Custom UI labels for the editor UI.
   */
  labels?: LiveEditorLabels;
  /**
   * Base configuration for the selective editor.
   */
  selectiveConfig: LiveEditorSelectiveEditorConfig;
  /**
   * Editor state.
   */
  state: EditorState;
  /**
   * Is the editor being used in a testing environment?
   *
   * For example: selenium or webdriver.
   */
  isTest?: boolean;
}

export interface LiveEditorParts {
  content: ContentPart;
  empty: EmptyPart;
  menu: MenuPart;
  modals: ModalsPart;
  notifications: NotificationsPart;
  overview: OverviewPart;
  preview: PreviewPart;
  toasts: ToastsPart;
}

export class LiveEditor {
  config: LiveEditorConfig;
  container: HTMLElement;
  isPendingRender?: boolean;
  isRendering?: boolean;
  parts: LiveEditorParts;
  projectType?: ProjectTypeComponent;
  state: EditorState;
  storage: DataStorage;

  constructor(config: LiveEditorConfig, container: HTMLElement) {
    this.config = config;
    this.container = container;
    this.storage = new LocalDataStorage();
    this.state = this.config.state;
    this.parts = {
      content: new ContentPart({
        selectiveConfig: this.config.selectiveConfig,
        state: this.state,
        storage: this.storage,
      }),
      empty: new EmptyPart({
        state: this.state,
      }),
      menu: new MenuPart({
        state: this.state,
        storage: this.storage,
      }),
      modals: new ModalsPart(),
      notifications: new NotificationsPart(),
      overview: new OverviewPart({
        state: this.state,
      }),
      preview: new PreviewPart({
        state: this.state,
        storage: this.storage,
      }),
      toasts: new ToastsPart(),
    };

    // Bind the editor to the global selective config.
    if (this.config.selectiveConfig.global) {
      this.config.selectiveConfig.global.editor = this;
    }

    // Update the project type when the project changes.
    this.state.addListener('getProject', () => {
      if (this.state.project?.type === ProjectTypes.Grow) {
        this.updateProjectType(new GrowProjectType());
      } else if (this.state.project?.type === ProjectTypes.Amagaki) {
        this.updateProjectType(new AmagakiProjectType());
      }

      // Pull in the UI labels.
      if (this.state.project?.ui?.labels) {
        this.config.labels = Object.assign(
          {},
          this.config.labels || {},
          this.state.project?.ui?.labels
        );
      }
    });

    // Automatically re-render after the window resizes.
    window.addEventListener('resize', () => {
      this.render();
    });

    // Handle the global key bindings.
    container.addEventListener('keydown', (evt: KeyboardEvent) => {
      if (evt.ctrlKey || evt.metaKey) {
        switch (evt.key) {
          case 's':
            evt.preventDefault();
            document.dispatchEvent(new CustomEvent(EVENT_SAVE));
            break;
        }
      }
    });

    // Bind to the custom event to re-render the editor.
    document.addEventListener(EVENT_RENDER, () => {
      this.render();
    });

    // Bind to the selective event for rendering as well.
    document.addEventListener(SELECTIVE_EVENT_RENDER, () => {
      this.render();
    });
  }

  classesForEditor(): Record<string, boolean> {
    return {
      le: true,
      'le--docked-menu': this.parts.menu.isDocked,
    };
  }

  render() {
    if (this.isRendering) {
      this.isPendingRender = true;
      return;
    }
    this.isPendingRender = false;
    this.isRendering = true;

    render(this.template(this), this.container);

    this.isRendering = false;
    document.dispatchEvent(new CustomEvent(EVENT_RENDER_COMPLETE));

    if (this.isPendingRender) {
      this.render();
    }
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${classMap(this.classesForEditor())}>
      ${this.parts.menu.template(editor)}
      <div class="le__structure__content">
        <div class="le__structure__content_header">
          ${this.parts.overview.template(editor)}
        </div>
        ${this.templateContentStructure(editor)}
      </div>
      ${this.parts.modals.template(editor)}
      ${this.parts.toasts.template(editor)}
    </div>`;
  }

  templateContentStructure(editor: LiveEditor): TemplateResult {
    if (!this.state.file) {
      return this.parts.empty.template(editor);
    }

    // Not having a url also qualifies to not show the preview.
    if (this.parts.content.isExpanded || !this.state.file.url) {
      return html`<div class="le__structure__content_only">
        ${this.parts.content.template(editor)}
      </div>`;
    }

    if (this.parts.preview.isExpanded) {
      return html`<div class="le__structure__preview_only">
        ${this.parts.preview.template(editor)}
      </div>`;
    }

    return html`<div class="le__structure__content_panes">
      ${this.parts.content.template(editor)}
      ${this.parts.preview.template(editor)}
    </div>`;
  }

  updateProjectType(projectType: ProjectTypeComponent) {
    this.projectType = projectType;
    this.config.selectiveConfig = this.config.selectiveConfig || {};

    // Update selective fields available.
    this.config.selectiveConfig.fieldTypes =
      this.config.selectiveConfig.fieldTypes || {};

    for (const [key, value] of Object.entries(
      this.projectType.fieldTypes || {}
    )) {
      this.config.selectiveConfig.fieldTypes[key] = value;
    }

    // Update selective validation rules available.
    this.config.selectiveConfig.ruleTypes =
      this.config.selectiveConfig.ruleTypes || {};

    for (const [key, value] of Object.entries(
      this.projectType.ruleTypes || {}
    )) {
      this.config.selectiveConfig.ruleTypes[key] = value;
    }

    // Event to allow existing selective editors to reset.
    document.dispatchEvent(new CustomEvent(EVENT_PROJECT_TYPE_UPDATE));
  }
}

/**
 * Custom labels for the editor UI.
 */
export interface LiveEditorLabels {
  /**
   * Label for content save action.
   */
  contentSave?: string;
  /**
   * Label for content save action clean state.
   */
  contentSaveClean?: string;
  /**
   * Label for content save action processing.
   */
  contentSaveErrors?: string;
  /**
   * Label for content save action processing.
   */
  contentSaveProcessing?: string;
  /**
   * Label for media field extra fields.
   */
  fieldMediaExtra?: string;
  /**
   * Label for media field sub fields.
   */
  fieldMediaFields?: string;
  /**
   * Label for media field label.
   */
  fieldMediaLabel?: string;
  /**
   * Label for media field path.
   */
  fieldMediaPath?: string;
  /**
   * Label for media field preview.
   */
  fieldMediaPreview?: string;
  /**
   * Label for the file.
   */
  file?: string;
  /**
   * Label for action to create new file.
   */
  fileNew?: string;
  /**
   * Label for the files structure.
   */
  files?: string;
  /**
   * Label for the site section of the menu.
   */
  menuSite?: string;
  /**
   * Label for the users section of the menu.
   */
  menuUsers?: string;
  /**
   * Label for the workspaces section of the menu.
   */
  menuWorkspaces?: string;
  /**
   * Label for publishing when a publish has been completed.
   */
  publishComplete?: string;
  /**
   * Label for publishing when a publish has failed.
   */
  publishFailure?: string;
  /**
   * Submit button label for the publish modal window.
   */
  publishModalSubmit?: string;
  /**
   * Title for the publish modal window.
   */
  publishModalTitle?: string;
  /**
   * Label for publishing when there are not changes to publish.
   */
  publishNoChanges?: string;
  /**
   * Label for publishing when a publish is not allowed.
   */
  publishNotAllowed?: string;
  /**
   * Label for publishing when a publish has not been started.
   */
  publishNotStarted?: string;
  /**
   * Label for publishing when a publish is in progress.
   */
  publishPending?: string;
  /**
   * Label for the workspace.
   */
  workspace?: string;
  /**
   * Label for the action to create a new workspace.
   */
  workspaceNew?: string;
  /**
   * Label for the workspace.
   */
  workspaces?: string;
}
