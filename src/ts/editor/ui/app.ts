import {ContentPart, ContentPartConfig} from './parts/content';
import {DashboardPart, DashboardPartConfig} from './parts/dashboard';
import {EVENT_RENDER, EVENT_RENDER_COMPLETE} from '../events';
import {EditorState, Schemes, StatePromiseKeys} from '../state';
import {LiveEditor, LiveEditorSelectiveEditorConfig} from '../editor';
import {MenuPart, MenuPartConfig} from './parts/menu';
import {ModalsPart, ModalsPartConfig} from './parts/modals';
import {
  NotificationsPart,
  NotificationsPartConfig,
} from './parts/notifications';
import {OnboardingPart, OnboardingPartConfig} from './parts/onboarding';
import {OverviewPart, OverviewPartConfig} from './parts/overview';
import {PreviewPart, PreviewPartConfig} from './parts/preview';
import {TemplateResult, classMap, html, render} from '@blinkk/selective-edit';
import {ToastsPart, ToastsPartConfig} from './parts/toasts';

import {DataStorage} from '../../utility/dataStorage';
import {LazyUiParts} from './parts';
import {OnboardingStatus} from '../api';
import {EVENT_RENDER as SELECTIVE_EVENT_RENDER} from '@blinkk/selective-edit/dist/selective/events';
import TimeAgo from 'javascript-time-ago';
import en from '../../timeago-locale-en.json';
import {templateLoading} from '../template';

// Set the default locale for the time ago globally.
TimeAgo.addDefaultLocale(en);

/**
 * Configuration for the editor UI.
 */
export interface AppUiConfig {
  /**
   * Editor.
   */
  editor: LiveEditor;
  /**
   * Base configuration for the selective editor.
   */
  selectiveConfig: LiveEditorSelectiveEditorConfig;
  /**
   * Editor state.
   */
  state: EditorState;
  /**
   * Storage for the editor config.
   */
  storage: DataStorage;
}

/**
 * UI for the editor app.
 *
 * All UI output for the editor is handled from this class.
 */
export class AppUi {
  config: AppUiConfig;
  container: HTMLElement;
  isPendingRender?: boolean;
  isRendering?: boolean;
  parts: LazyUiParts;

  constructor(config: AppUiConfig, container: HTMLElement) {
    this.config = config;
    this.container = container;
    this.parts = new LazyUiParts();

    this.parts.register('content', ContentPart, {
      editor: this.config.editor,
      selectiveConfig: this.config.selectiveConfig,
      state: this.config.state,
      storage: this.config.storage,
    } as ContentPartConfig);
    this.parts.register('dashboard', DashboardPart, {
      editor: this.config.editor,
      state: this.config.state,
      storage: this.config.storage,
    } as DashboardPartConfig);
    this.parts.register('menu', MenuPart, {
      editor: this.config.editor,
      state: this.config.state,
      storage: this.config.storage,
    } as MenuPartConfig);
    this.parts.register('modals', ModalsPart, {
      editor: this.config.editor,
    } as ModalsPartConfig);
    this.parts.register('notifications', NotificationsPart, {
      editor: this.config.editor,
    } as NotificationsPartConfig);
    this.parts.register('onboarding', OnboardingPart, {
      editor: this.config.editor,
      state: this.config.state,
    } as OnboardingPartConfig);
    this.parts.register('overview', OverviewPart, {
      editor: this.config.editor,
      state: this.config.state,
    } as OverviewPartConfig);
    this.parts.register('preview', PreviewPart, {
      editor: this.config.editor,
      state: this.config.state,
      storage: this.config.storage,
    } as PreviewPartConfig);
    this.parts.register('toasts', ToastsPart, {
      editor: this.config.editor,
    } as ToastsPartConfig);

    // Automatically re-render after the window resizes.
    window.addEventListener('resize', () => {
      this.render();
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

  classesForApp(): Record<string, boolean> {
    const classes: Record<string, boolean> = {
      le: true,
      'scheme-dark': this.config.state.scheme === Schemes.Dark,
      'scheme-light': this.config.state.scheme === Schemes.Light,
    };

    // Make sure that the menu is in use before checking for docked menu.
    // If the onboarding status becomes invalid the docked state fails.
    if (
      this.parts.has('menu') &&
      this.config.state.onboardingInfo?.status === OnboardingStatus.Valid
    ) {
      classes['le--docked-menu'] = this.partMenu.isDocked;
    }

    return classes;
  }

  get partContent(): ContentPart {
    return this.parts.get('content') as ContentPart;
  }

  get partDashboard(): DashboardPart {
    return this.parts.get('dashboard') as DashboardPart;
  }

  get partMenu(): MenuPart {
    return this.parts.get('menu') as MenuPart;
  }

  get partModals(): ModalsPart {
    return this.parts.get('modals') as ModalsPart;
  }

  get partNotifications(): NotificationsPart {
    return this.parts.get('notifications') as NotificationsPart;
  }

  get partOnboarding(): OnboardingPart {
    return this.parts.get('onboarding') as OnboardingPart;
  }

  get partOverview(): OverviewPart {
    return this.parts.get('overview') as OverviewPart;
  }

  get partPreview(): PreviewPart {
    return this.parts.get('preview') as PreviewPart;
  }

  get partToasts(): ToastsPart {
    return this.parts.get('toasts') as ToastsPart;
  }

  /**
   * Renders the app into the container.
   *
   * If a render is already in process other renders are
   * debounced and rerendered after the current render is complete.
   */
  render(): void {
    if (this.isRendering) {
      this.isPendingRender = true;
      return;
    }
    this.isPendingRender = false;
    this.isRendering = true;

    render(this.template(), this.container);

    this.isRendering = false;
    document.dispatchEvent(new CustomEvent(EVENT_RENDER_COMPLETE));

    if (this.isPendingRender) {
      this.render();
    }
  }

  /**
   * Template that is rendered for the app.
   *
   * This template is 'root' template for the entire app UI.
   * In other words, the entire app UI structure starts from
   * this template.
   */
  template(): TemplateResult {
    const parts: Array<TemplateResult> = [];

    // Check if we need to onboard the user.
    if (this.config.state.onboardingInfo?.status === OnboardingStatus.Valid) {
      parts.push(this.partMenu.template());
      parts.push(this.templateContentStructure());
    } else if (this.config.state.onboardingInfo === undefined) {
      this.config.state.checkOnboarding();
      parts.push(templateLoading());
    } else {
      parts.push(this.partOnboarding.template());
    }

    // Modals and Toasts are available globally.
    // They do not show a UI by default.
    parts.push(this.partModals.template());
    parts.push(this.partToasts.template());

    return html`<div class=${classMap(this.classesForApp())}>${parts}</div>`;
  }

  templateContentStructure(): TemplateResult {
    const parts: Array<TemplateResult> = [];

    if (
      !this.config.state.file &&
      !this.config.state.inProgress(StatePromiseKeys.GetFile)
    ) {
      parts.push(this.partDashboard.template());
    } else if (this.partContent.isExpanded) {
      parts.push(html`<div class="le__structure__content_only">
        ${this.partContent.template()}
      </div>`);
    } else if (this.partPreview.isExpanded) {
      parts.push(html`<div class="le__structure__preview_only">
        ${this.partPreview.template()}
      </div>`);
    } else {
      parts.push(html`<div class="le__structure__content_panes">
        ${this.partContent.template()} ${this.partPreview.template()}
      </div>`);
    }

    return html`<div class="le__structure__content">
      <div class="le__structure__content_header">
        ${this.partOverview.template()}
      </div>
      ${parts}
    </div>`;
  }
}
