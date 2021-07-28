import {BasePart, UiPartComponent, UiPartConfig} from '.';
import {TemplateResult, html} from '@blinkk/selective-edit';

import {DataStorage} from '../../utility/dataStorage';
import {EditorState} from '../state';

export interface OnboardingPartConfig extends UiPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  storage: DataStorage;
}

export class OnboardingPart extends BasePart implements UiPartComponent {
  config: OnboardingPartConfig;

  constructor(config: OnboardingPartConfig) {
    super();
    this.config = config;
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__panel: true,
      le__part__onboarding: true,
    };
  }

  template(): TemplateResult {
    return html`Onboarding...`;
  }
}
