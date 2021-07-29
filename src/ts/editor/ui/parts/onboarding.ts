import {BasePart, LazyUiParts, UiPartComponent, UiPartConfig} from '.';
import {
  GitHubOnboardingPart,
  GitHubOnboardingPartConfig,
} from './onboarding/github';
import {
  HeaderOnboardingPart,
  HeaderOnboardingPartConfig,
} from './onboarding/header';
import {
  LocalOnboardingPart,
  LocalOnboardingPartConfig,
} from './onboarding/local';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';

import {DataStorage} from '../../../utility/dataStorage';
import {EditorState} from '../../state';
import {OnboardingFlow} from '../../api';

export interface OnboardingPartConfig extends UiPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  storage: DataStorage;
}

export class OnboardingPart extends BasePart implements UiPartComponent {
  config: OnboardingPartConfig;
  parts: LazyUiParts;

  constructor(config: OnboardingPartConfig) {
    super();
    this.config = config;

    this.parts = new LazyUiParts();

    this.parts.register('header', HeaderOnboardingPart, {
      editor: this.config.editor,
    } as HeaderOnboardingPartConfig);

    this.parts.register('local', LocalOnboardingPart, {
      editor: this.config.editor,
      state: this.config.state,
    } as LocalOnboardingPartConfig);
    this.parts.register('github', GitHubOnboardingPart, {
      editor: this.config.editor,
      state: this.config.state,
    } as GitHubOnboardingPartConfig);
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__panel: true,
      le__part__onboarding: true,
    };
  }

  get partGitHub(): GitHubOnboardingPart {
    return this.parts.get('github') as GitHubOnboardingPart;
  }

  get partHeader(): HeaderOnboardingPart {
    return this.parts.get('header') as HeaderOnboardingPart;
  }

  get partLocal(): LocalOnboardingPart {
    return this.parts.get('local') as LocalOnboardingPart;
  }

  template(): TemplateResult {
    const parts: Array<TemplateResult> = [this.partHeader.template()];

    if (this.config.state.onboardingInfo?.flow === OnboardingFlow.Local) {
      parts.push(this.partLocal.template());
    } else if (
      this.config.state.onboardingInfo?.flow === OnboardingFlow.GitHub
    ) {
      parts.push(this.partGitHub.template());
    } else {
      parts.push(
        html`Missing information needed to start the editor and unknown
        onboarding process.`
      );
    }

    return html`<div class=${classMap(this.classesForPart())}>${parts}</div>`;
  }
}
