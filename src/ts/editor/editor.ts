import {DataStorage, LocalDataStorage} from '../utility/dataStorage';
import {EditorConfig, GlobalConfig} from '@blinkk/selective-edit';
import {EditorState, StatePromiseKeys} from './state';
import {LiveEditorApiComponent, ProjectTypes} from './api';

import {AmagakiProjectType} from '../projectType/amagaki/amagakiProjectType';
import {AppUi} from './ui/app';
import {EVENT_SAVE} from './events';
import {GrowProjectType} from '../projectType/grow/growProjectType';
import {LiveEditorLabels} from './template';
import {PreviewCommunicator} from './preview';
import {ProjectTypeComponent} from '../projectType/projectType';
import cloneDeep from 'lodash.clonedeep';

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

export class LiveEditor {
  ui: AppUi;
  config: LiveEditorConfig;
  isPendingRender?: boolean;
  isRendering?: boolean;
  /**
   * Used to handle communiction between the editor and the preview iframe.
   */
  preview: PreviewCommunicator;
  state: EditorState;
  storage: DataStorage;

  constructor(config: LiveEditorConfig, container: HTMLElement) {
    this.config = config;
    this.storage = new LocalDataStorage();
    this.state = this.config.state;
    this.preview = new PreviewCommunicator();

    // Bind the editor to the global selective config.
    if (this.config.selectiveConfig.global) {
      this.config.selectiveConfig.global.editor = this;
    }

    this.ui = new AppUi(
      {
        editor: this,
        state: this.state,
        storage: this.storage,
        selectiveConfig: this.config.selectiveConfig,
      },
      container
    );

    // Update the project type when the project changes.
    this.state.addListener(StatePromiseKeys.GetProject, () => {
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
  }

  get api(): LiveEditorApiComponent {
    return this.config.api;
  }

  render() {
    this.ui.render();
  }

  updateProjectType(projectType: ProjectTypeComponent) {
    this.state.setProjectType(projectType);
  }
}

/**
 * When using the selective configuration for different forms is uses a global
 * configuration, but the individual selective editors may try to change the
 * config since it is not immutable, so we need to deep copy the configuration
 * while preserving the references to objects.
 */
export function cloneSelectiveConfig(
  config: LiveEditorSelectiveEditorConfig
): LiveEditorSelectiveEditorConfig {
  // TODO: Clone without cloning global key?
  const newConfig = cloneDeep(config);
  newConfig.global = config.global;
  return newConfig;
}
