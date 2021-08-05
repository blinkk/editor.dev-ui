import {BasePart, LazyUiParts, UiPartComponent, UiPartConfig} from '.';
import {
  GitHubOnboardingPart,
  GitHubOnboardingPartConfig,
} from './onboarding/github';
import {
  LocalOnboardingPart,
  LocalOnboardingPartConfig,
} from './onboarding/local';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';
import {
  ToolbarOnboardingPart,
  ToolbarOnboardingPartConfig,
} from './onboarding/toolbar';

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
  breadcrumbs: OnboardingBreadcrumbs;

  constructor(config: OnboardingPartConfig) {
    super();
    this.config = config;
    this.breadcrumbs = new OnboardingBreadcrumbs();

    this.parts = new LazyUiParts();

    this.parts.register('toolbar', ToolbarOnboardingPart, {
      breadcrumbs: this.breadcrumbs,
      editor: this.config.editor,
    } as ToolbarOnboardingPartConfig);

    this.parts.register('local', LocalOnboardingPart, {
      breadcrumbs: this.breadcrumbs,
      editor: this.config.editor,
      state: this.config.state,
    } as LocalOnboardingPartConfig);
    this.parts.register('github', GitHubOnboardingPart, {
      breadcrumbs: this.breadcrumbs,
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

  get partToolbar(): ToolbarOnboardingPart {
    return this.parts.get('toolbar') as ToolbarOnboardingPart;
  }

  get partLocal(): LocalOnboardingPart {
    return this.parts.get('local') as LocalOnboardingPart;
  }

  template(): TemplateResult {
    const parts: Array<TemplateResult> = [this.partToolbar.template()];

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

/**
 * Parts of the breadcrumb for the onboarding header.
 */
export interface BreadcrumPart {
  label: string;
  handleClick?: (evt: Event) => void;
}

export class OnboardingBreadcrumbs {
  crumbs: Array<BreadcrumPart>;

  constructor() {
    this.crumbs = [];
  }

  addBreadcrumb(crumb: BreadcrumPart, index?: number, clearRest?: boolean) {
    if (index) {
      this.crumbs[index] = crumb;
    } else {
      this.crumbs.push(crumb);
    }

    if (index && clearRest) {
      this.crumbs = this.crumbs.slice(0, index);
    }
  }
}
