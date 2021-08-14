import {BasePart, LazyUiParts, UiPartComponent, UiPartConfig} from '.';
import {DeviceData, EditorPreviewSettings, WorkspaceData} from '../../api';
import {EditorState, StatePromiseKeys} from '../../state';
import {PreviewFramePart, PreviewFramePartConfig} from './preview/frame';
import {PreviewToolbarPart, PreviewToolbarPartConfig} from './preview/toolbar';
import {TemplateResult, classMap, html} from '@blinkk/selective-edit';

import {DataStorage} from '../../../utility/dataStorage';
import {interpolatePreviewUrl} from '../../preview';
import {templateLoading} from '../../template';

export interface PreviewPartConfig extends UiPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
  /**
   * Storage class for working with settings.
   */
  storage: DataStorage;
}

export class PreviewPart extends BasePart implements UiPartComponent {
  config: PreviewPartConfig;
  device?: DeviceData;
  parts: LazyUiParts;
  loginWindow?: Window | null;
  loginTimer?: number;

  constructor(config: PreviewPartConfig) {
    super();
    this.config = config;

    this.parts = new LazyUiParts();

    this.parts.register('frame', PreviewFramePart, {
      state: this.config.state,
      storage: this.config.storage,
    } as PreviewToolbarPartConfig);
    this.parts.register('toolbar', PreviewToolbarPart, {
      state: this.config.state,
      storage: this.config.storage,
    } as PreviewFramePartConfig);
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__panel: true,
      le__part__preview: true,
      'le__part__preview--device_mode':
        (this.partToolbar.isDeviceMode || false) &&
        Boolean(this.partToolbar.device),
    };
  }

  get isExpanded(): boolean {
    return this.partToolbar.isExpanded || false;
  }

  handleLoginClick() {
    if (this.loginTimer) {
      clearInterval(this.loginTimer);
    }

    const baseUrl = interpolatePreviewUrl(
      this.config.state.project?.preview as EditorPreviewSettings,
      this.config.state.workspace as WorkspaceData
    );

    // Open the base url in a new window to let it trigger any auth
    // requirements before we try to load the preview config again.
    this.loginWindow = window.open(
      baseUrl,
      'editor-preview-login',
      'resizable,scrollbars,status,width=600,height=400'
    );

    // Use interval to check for when the window is closed to reload
    // the preview config since it is on a different domain.
    this.loginTimer = setInterval(() => {
      if (this.loginWindow?.closed) {
        clearInterval(this.loginTimer);
        this.handleRefreshClick();
      }
    }, 1500) as unknown as number;
  }

  handleRefreshClick() {
    // Reset the preview config before reloading it shows the loading UI.
    this.config.state.previewConfig = undefined;
    this.config.state.getPreviewConfig();
    this.render();
  }

  get partFrame(): PreviewFramePart {
    return this.parts.get('frame') as PreviewFramePart;
  }

  get partToolbar(): PreviewToolbarPart {
    return this.parts.get('toolbar') as PreviewToolbarPart;
  }

  template(): TemplateResult {
    const pieces: Array<TemplateResult> = [];

    pieces.push(this.partToolbar.template());

    if (this.config.state.filePreviewUrl) {
      pieces.push(
        this.partFrame.template(
          this.partToolbar.device,
          this.partToolbar.isRotated
        )
      );
    } else if (this.config.state.previewConfig === undefined) {
      pieces.push(this.templatePreviewConfigLoading());
    } else if (this.config.state.previewConfig === null) {
      // Check if we tried to load it and it failed.
      if (this.config.state.project?.preview?.baseUrl) {
        pieces.push(this.templatePreviewConfigLoadingError());
      } else {
        pieces.push(this.templatePreviewNotConfigured());
      }
    } else {
      pieces.push(this.templatePreviewNotAvailable());
    }

    return html`<div class=${classMap(this.classesForPart())}>${pieces}</div>`;
  }

  templatePreviewConfigLoading(): TemplateResult {
    return templateLoading({}, html`<div>Searching for file preview.</div>`);
  }

  templatePreviewConfigLoadingError(): TemplateResult {
    return html`<div class="le__part__preview__message">
      <h3>Trouble connecting to preview server</h3>
      <p>
        You may need to sign in to the preview server, or it may be offline.
        Sign into the preview server then reload this page.
      </p>
      <div>
        <button
          class="le__button le__button--outline le__button--primary"
          @click=${this.handleLoginClick.bind(this)}
        >
          Sign in to preview server
        </button>
        <button class="le__button" @click=${this.handleRefreshClick.bind(this)}>
          Reload
        </button>
      </div>
    </div>`;
  }

  templatePreviewNotAvailable(): TemplateResult {
    // When waiting for the file to load do not show anything
    // since the file load is already showing.
    if (
      !this.config.state.loadingFilePath &&
      this.config.editor.state.inProgress(StatePromiseKeys.GetFile)
    ) {
      return html``;
    }

    return html`<div class="le__part__preview__message">
      <h3>No preview found for file</h3>
      <p>This file doesn't have a preview associated with it.</p>
    </div>`;
  }

  templatePreviewNotConfigured(): TemplateResult {
    // TODO: Link to the documentation on setting up a preview server.
    return html`<div class="le__part__preview__message">
      <h3>No preview server</h3>
      <p>
        A preview server has not yet been set up for this project. Ask a
        developer to set up a preview server for reactive previews.
      </p>
    </div>`;
  }
}
