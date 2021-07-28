import {ContentPart, ContentPartConfig} from './parts/content';
import {DashboardPart, DashboardPartConfig} from './parts/dashboard';
import {EVENT_RENDER, EVENT_RENDER_COMPLETE} from './events';
import {EditorState, Schemes, StatePromiseKeys} from './state';
import {LiveEditor, LiveEditorSelectiveEditorConfig} from './editor';
import {MenuPart, MenuPartConfig} from './parts/menu';
import {ModalsPart, ModalsPartConfig} from './parts/modals';
import {
  NotificationsPart,
  NotificationsPartConfig,
} from './parts/notifications';
import {OverviewPart, OverviewPartConfig} from './parts/overview';
import {PreviewPart, PreviewPartConfig} from './parts/preview';
import {TemplateResult, classMap, html, render} from '@blinkk/selective-edit';
import {ToastsPart, ToastsPartConfig} from './parts/toasts';

import {DataStorage} from '../utility/dataStorage';
import {LazyUiParts} from './parts';
import {EVENT_RENDER as SELECTIVE_EVENT_RENDER} from '@blinkk/selective-edit/dist/selective/events';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

// Set the default locale for the time ago globally.
TimeAgo.addDefaultLocale(en);

/**
 * Configuration for the live editor.
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
    if (this.parts.has('menu')) {
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

  get partOverview(): OverviewPart {
    return this.parts.get('overview') as OverviewPart;
  }

  get partPreview(): PreviewPart {
    return this.parts.get('preview') as PreviewPart;
  }

  get partToasts(): ToastsPart {
    return this.parts.get('toasts') as ToastsPart;
  }

  render() {
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

  template(): TemplateResult {
    const parts: Array<TemplateResult> = [];

    parts.push(this.partMenu.template());
    parts.push(this.templateContentStructure());
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