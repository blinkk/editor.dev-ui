import {ApiError, PublishResult, PublishStatus} from '../api';
import {BasePart, Part} from '.';
import {
  DeepObject,
  TemplateResult,
  classMap,
  html,
} from '@blinkk/selective-edit';
import {DialogActionLevel, FormDialogModal} from '../ui/modal';
import {EVENT_WORKSPACE_LOAD} from '../events';
import {EditorState} from '../state';
import {FieldConfig} from '@blinkk/selective-edit/dist/src/selective/field';
import {LiveEditor} from '../editor';
import {NotificationAction} from './notifications';
import TimeAgo from 'javascript-time-ago';
import merge from 'lodash.merge';

const MODAL_KEY_PUBLISH = 'overview_publish';

export interface OverviewPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
}

export class OverviewPart extends BasePart implements Part {
  config: OverviewPartConfig;
  isPendingPublish?: boolean;
  timeAgo: TimeAgo;

  constructor(config: OverviewPartConfig) {
    super();
    this.config = config;
    this.timeAgo = new TimeAgo('en-US');
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__overview: true,
    };
  }

  protected getOrCreateModalPublish(
    editor: LiveEditor,
    fields: Array<FieldConfig>
  ): FormDialogModal {
    if (!editor.parts.modals.modals[MODAL_KEY_PUBLISH]) {
      const selectiveConfig = merge(
        {
          fields: fields,
        },
        editor.config.selectiveConfig
      );
      const modal = new FormDialogModal({
        title: editor.config.labels?.publishModalTitle || 'Publish',
        selectiveConfig: selectiveConfig,
      });
      modal.templateModal = this.templatePublishWorkspace.bind(this);
      modal.actions.push({
        label: editor.config.labels?.publishModalSubmit || 'Publish',
        level: DialogActionLevel.Primary,
        isDisabledFunc: () => {
          return modal.isProcessing || !modal.selective.isValid;
        },
        isSubmit: true,
        onClick: () => {
          this.isPendingPublish = true;
          modal.startProcessing();

          const value = modal.selective.value;
          const workspace = this.config.state.workspace;
          if (!workspace) {
            return;
          }

          this.config.state.publish(
            workspace,
            value,
            (result: PublishResult) => {
              this.showPublishResult(editor, result);

              // Reset the data for the next time the form is shown.
              modal.data = new DeepObject();
              this.isPendingPublish = false;
              modal.stopProcessing(true);
            },
            (error: ApiError) => {
              // Log the error to the notifications.
              editor.parts.notifications.addError(error, true);
              modal.error = error;
              this.isPendingPublish = false;
              modal.stopProcessing();
            }
          );
        },
      });
      modal.addCancelAction();
      editor.parts.modals.modals[MODAL_KEY_PUBLISH] = modal;
    }
    return editor.parts.modals.modals[MODAL_KEY_PUBLISH] as FormDialogModal;
  }

  handlePublishClick(evt: Event, editor: LiveEditor) {
    const project = this.config.state.project;

    if (!project) {
      return;
    }

    if (!(project.publish?.fields || []).length) {
      // No fields defined for publishing.
      // Call the api for publishing without collecting data.

      const workspace = this.config.state.workspace;
      if (!workspace) {
        return;
      }

      this.isPendingPublish = true;
      this.render();

      this.config.state.publish(workspace, {}, (result: PublishResult) => {
        this.isPendingPublish = false;
        this.showPublishResult(editor, result);
      });
      return;
    }

    // Need to collect additional data, show the modal for the form.
    const modal = this.getOrCreateModalPublish(
      editor,
      project.publish?.fields || []
    );
    modal.show();
  }

  loadProject() {
    this.config.state.getProject();
  }

  loadWorkspace() {
    this.config.state.getWorkspace();
  }

  showPublishResult(editor: LiveEditor, result: PublishResult) {
    console.log('publish result', result);

    const actions: Array<NotificationAction> = [];
    const currentWorkspace = this.config.state.workspace;
    let message = '';

    if ([PublishStatus.Complete].includes(result.status)) {
      message = `Published '${currentWorkspace?.name}' workspace successfully.`;
      if (
        result.workspace?.name &&
        currentWorkspace?.name !== result.workspace?.name
      ) {
        message = `${message} The current workspace is no longer available,
          please switch to the '${result.workspace?.name}' workspace to continue
          editing.`;
        actions.push({
          label: `Switch to ${result.workspace?.name} workspace`,
          customEvent: EVENT_WORKSPACE_LOAD,
          details: result.workspace,
        });
      }

      editor.parts.notifications.showNotification({
        actions: actions,
        message: message,
        title: 'Workspace published',
      });
    }
    this.render();
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class=${classMap(this.classesForPart())}>
      ${this.templateMenu(editor)} ${this.templateProject(editor)}
      ${this.templateWorkspace(editor)} ${this.templatePublish(editor)}
      ${editor.parts.notifications.template(editor)}
    </div>`;
  }

  templateMenu(editor: LiveEditor): TemplateResult {
    if (editor.parts.menu.isDocked) {
      return html``;
    }

    const handleMenuClick = () => {
      editor.parts.menu.toggle();
    };

    return html`<div
      class="le__part__overview__menu le__clickable"
      @click=${handleMenuClick}
    >
      <span class="material-icons">menu</span>
    </div>`;
  }

  templateProject(editor: LiveEditor): TemplateResult {
    const project = this.config.state.project;

    // Lazy load the project.
    if (!project) {
      this.loadProject();
    }

    let projectName = project?.title || html`&nbsp;`;

    // Menu shows the project name when it is docked.
    if (editor.parts.menu.isDocked) {
      projectName = html`&nbsp;`;
    }

    return html`<div class="le__part__overview__title">${projectName}</div>`;
  }

  templatePublish(editor: LiveEditor): TemplateResult {
    const project = this.config.state.project;
    const workspace = this.config.state.workspace;

    // Lazy load the project.
    if (!project) {
      this.loadProject();
    }

    // Lazy load the workspace.
    if (!workspace) {
      this.loadWorkspace();
    }

    // Check if the project does not allow publishing.
    const hasProjectPublish = project?.publish !== undefined;
    if (!hasProjectPublish) {
      return html``;
    }

    // Check if the workspace does not allow publishing.
    if (workspace?.publish?.status === PublishStatus.NotAllowed) {
      return html``;
    }

    // Get the current status from the workspace.
    const status = workspace?.publish?.status || PublishStatus.NotStarted;

    let label = editor.config.labels?.publishNotStarted || 'Publish';
    if (this.isPendingPublish || status === PublishStatus.Pending) {
      label = editor.config.labels?.publishNotStarted || 'Pending';
    } else if (status === PublishStatus.NoChanges) {
      label = editor.config.labels?.publishNoChanges || 'No changes';
    } else if (status === PublishStatus.Complete) {
      label = editor.config.labels?.publishComplete || 'Published';
    } else if (status === PublishStatus.Failure) {
      label = editor.config.labels?.publishFailure || 'Publish error';
    }

    return html`<div class="le__part__overview__publish">
      <button
        class=${classMap({
          le__button: true,
          'le__button--on-secondary': true,
          'le__button--secondary': [
            PublishStatus.Complete,
            PublishStatus.NoChanges,
            PublishStatus.NotStarted,
            PublishStatus.Pending,
          ].includes(status),
          'le__button--extreme': [PublishStatus.Failure].includes(status),
        })}
        @click=${(evt: Event) => {
          this.handlePublishClick(evt, editor);
        }}
        ?disabled=${[
          PublishStatus.NoChanges,
          PublishStatus.NotAllowed,
        ].includes(status)}
      >
        ${label}
      </button>
    </div>`;
  }

  templatePublishWorkspace(editor: LiveEditor): TemplateResult {
    const modal = this.getOrCreateModalPublish(editor, []);
    const isValid = modal.selective.isValid;
    try {
      return modal.selective.template(modal.selective, modal.data);
    } finally {
      if (isValid !== modal.selective.isValid) {
        this.render();
      }
    }
  }

  templateWorkspace(editor: LiveEditor): TemplateResult {
    const workspace = this.config.state.workspace;

    // Lazy load the workspace.
    if (!workspace) {
      this.loadWorkspace();
    }

    return html`<div class="le__part__overview__workspace">
      <!-- <span>Workspace:</span> -->
      <strong>${workspace?.name || '...'}</strong> @
      <strong>${(workspace?.branch.commit.hash || '...').slice(0, 5)}</strong>
      by
      <strong>${workspace?.branch.commit.author.name || '...'}</strong>
      (${workspace?.branch?.commit.timestamp
        ? this.timeAgo.format(
            new Date(workspace?.branch?.commit.timestamp || new Date())
          )
        : '...'})
    </div>`;
  }
}
