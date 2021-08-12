import {ApiError, ProjectSource, PublishResult, PublishStatus} from '../../api';
import {BasePart, UiPartComponent, UiPartConfig} from '.';
import {
  DeepObject,
  TemplateResult,
  classMap,
  html,
  ifDefined,
  repeat,
} from '@blinkk/selective-edit';
import {DialogActionLevel, FormDialogModal} from '../modal';
import {EVENT_RENDER_COMPLETE, EVENT_WORKSPACE_LOAD} from '../../events';
import {
  LiveEditorSelectiveEditorConfig,
  cloneSelectiveConfig,
} from '../../editor';
import {exampleIcon, githubIcon, localIcon} from '../icons';

import {EditorState} from '../../state';
import {FieldConfig} from '@blinkk/selective-edit/dist/selective/field';
import {NotificationAction} from './notifications';
import TimeAgo from 'javascript-time-ago';
import merge from 'lodash.merge';

const MODAL_KEY_PUBLISH = 'overview_publish';

export interface OverviewPartConfig extends UiPartConfig {
  /**
   * State class for working with editor state.
   */
  state: EditorState;
}

export class OverviewPart extends BasePart implements UiPartComponent {
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
      le__panel: true,
      le__part__overview: true,
    };
  }

  protected getOrCreateModalPublish(
    fields: Array<FieldConfig>
  ): FormDialogModal {
    if (!this.config.editor.ui.partModals.modals[MODAL_KEY_PUBLISH]) {
      const selectiveConfig = merge(
        {},
        // Clone to prevent shared values if editor changes config.
        cloneSelectiveConfig(
          this.config.editor.config
            .selectiveConfig as LiveEditorSelectiveEditorConfig
        ),
        {
          fields: fields,
        }
      );
      const modal = new FormDialogModal({
        title: this.config.editor.config.labels?.publishModalTitle || 'Publish',
        selectiveConfig: selectiveConfig,
        state: this.config.state,
      });

      const handleSubmit = () => {
        this.isPendingPublish = true;
        modal.startProcessing();

        // The first time the selective editor is marked for validation the values
        // cannot be trusted.
        // The render step needs to complete before the validation can be trusted.
        if (!modal.selective.markValidation) {
          // Mark the selective editor for all field validation.
          // For UX the validation is not run until the user interacts with a
          // field or when they try to 'submit'.
          modal.selective.markValidation = true;

          document.addEventListener(
            EVENT_RENDER_COMPLETE,
            () => {
              handleSubmit();
            },
            {
              once: true,
            }
          );
          this.render();
          return;
        }

        if (modal.selective.isClean || !modal.selective.isValid) {
          modal.stopProcessing();
          return;
        }

        const value = modal.selective.value;
        const workspace = this.config.state.workspaceOrGetWorkspace();

        if (!workspace) {
          return;
        }

        this.config.state.publish(
          workspace,
          value,
          (result: PublishResult) => {
            this.showPublishResult(result);

            // Reset the data for the next time the form is shown.
            modal.data = new DeepObject();
            this.isPendingPublish = false;
            modal.stopProcessing(true);
          },
          (error: ApiError) => {
            // Log the error to the notifications.
            this.config.editor.ui.partNotifications.addError(error, true);
            modal.error = error;
            this.isPendingPublish = false;
            modal.stopProcessing();
          }
        );
      };

      modal.templateModal = this.templatePublishWorkspace.bind(this);
      modal.actions.push({
        label:
          this.config.editor.config.labels?.publishModalSubmit || 'Publish',
        level: DialogActionLevel.Primary,
        isDisabledFunc: () => {
          return modal.isProcessing || !modal.selective.isValid;
        },
        isSubmit: true,
        onClick: handleSubmit,
      });
      modal.addCancelAction();
      this.config.editor.ui.partModals.modals[MODAL_KEY_PUBLISH] = modal;
    }
    return this.config.editor.ui.partModals.modals[
      MODAL_KEY_PUBLISH
    ] as FormDialogModal;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handlePublishClick(evt: Event) {
    const project = this.config.state.projectOrGetProject();
    const workspace = this.config.state.workspaceOrGetWorkspace();

    if (!workspace || !project) {
      return;
    }

    // Check if the workspace is already in progress.
    if (workspace.publish?.status === PublishStatus.Pending) {
      // Open the url when there is a pending publish.
      if (workspace.publish.urls?.length) {
        const urlData = workspace.publish.urls[0];
        window.open(urlData.url, '_blank');
      }

      return;
    }

    if (!(project.publish?.fields || []).length) {
      // No fields defined for publishing.
      // Call the api for publishing without collecting data.

      this.isPendingPublish = true;
      this.render();

      this.config.state.publish(workspace, {}, (result: PublishResult) => {
        this.isPendingPublish = false;
        this.showPublishResult(result);
      });
      return;
    }

    // Need to collect additional data, show the modal for the form.
    const modal = this.getOrCreateModalPublish(project.publish?.fields || []);
    modal.show();
  }

  showPublishResult(result: PublishResult) {
    const actions: Array<NotificationAction> = [];
    const currentWorkspace = this.config.state.workspaceOrGetWorkspace();

    let message = '';

    if ([PublishStatus.Complete].includes(result.status as PublishStatus)) {
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

      this.config.editor.ui.partNotifications.showNotification({
        actions: actions,
        message: message,
        title: 'Workspace published',
      });
    }
    this.render();
  }

  template(): TemplateResult {
    return html`<div class=${classMap(this.classesForPart())}>
      ${this.templateMenu()} ${this.templateProject()} ${this.templateIcon()}
      ${this.templateWorkspace()} ${this.templatePublish()}
      ${this.config.editor.ui.partNotifications.template()}
      ${this.templateAccount()}
    </div>`;
  }

  templateAccount(): TemplateResult {
    const authentication =
      this.config.state.authenticationOrGetAuthentication();

    if (!authentication?.usesAccounts) {
      return html``;
    }

    const handleAccountClick = () => {
      this.config.editor.api
        .clearAuth()
        .then(() => {
          // Redirect to homepage after signing out.
          window.location.href = '/';
        })
        .catch(err => {
          console.error('Unable to sign out!', err);
        });
    };

    return html`<div
      class="le__part__overview__account le__clickable le__tooltip--bottom-left"
      @click=${handleAccountClick}
      data-tip="Sign out"
    >
      <span class="material-icons">logout</span>
    </div>`;
  }

  templateMenu(): TemplateResult {
    if (this.config.editor.ui.partMenu.isDocked) {
      return html``;
    }

    const handleMenuClick = () => {
      this.config.editor.ui.partMenu.toggle();
    };

    return html`<div
      class="le__part__overview__menu le__clickable le__tooltip--bottom-right"
      @click=${handleMenuClick}
      data-tip="Menu"
    >
      <span class="material-icons">menu</span>
    </div>`;
  }

  templateProject(): TemplateResult {
    return html`<div class="le__part__overview__title">
      ${this.config.editor.ui.partMenu.isDocked
        ? html`&nbsp;`
        : this.templateProjectTitle()}
    </div>`;
  }

  templateProjectTitle(): TemplateResult {
    const project = this.config.state.projectOrGetProject();
    const parts: Array<TemplateResult> = [];
    let links = project?.links?.breadcrumbs ?? [];

    // TODO: Better way of limiting the breadcrumbs for services.
    if (links.length > 2) {
      // Trim off the service level and branch level links.
      links = links.slice(1, -1);
    }

    // Menu shows the project name when it is docked.
    if (links.length) {
      parts.push(
        html`${repeat(
          links,
          link => link.url,
          link =>
            html`<span
              ><a href=${link.url} alt=${ifDefined(link.label)}
                >${link.label}</a
              ></span
            >`
        )}`
      );
    } else {
      parts.push(html`${project?.title || html`&nbsp;`}`);
    }

    return html`<div class="le__part__breadcrumb">${parts}</div>`;
  }

  templatePublish(): TemplateResult {
    const project = this.config.state.projectOrGetProject();
    const workspace = this.config.state.workspaceOrGetWorkspace();

    if (!workspace || !project) {
      return html``;
    }

    // Check if the project does not allow publishing.
    const hasProjectPublish = project?.publish !== undefined;
    if (!hasProjectPublish) {
      return html``;
    }

    // Get the current status from the workspace.
    const status =
      (workspace?.publish?.status as PublishStatus) || PublishStatus.NotStarted;

    // Check if the workspace does not allow publishing.
    if (status === PublishStatus.NotAllowed) {
      return html``;
    }

    let label =
      this.config.editor.config.labels?.publishNotStarted || 'Publish';
    if (this.isPendingPublish || status === PublishStatus.Pending) {
      label = this.config.editor.config.labels?.publishPending || 'Pending';
    } else if (status === PublishStatus.NoChanges) {
      label =
        this.config.editor.config.labels?.publishNoChanges || 'No changes';
    } else if (status === PublishStatus.Complete) {
      label = this.config.editor.config.labels?.publishComplete || 'Published';
    } else if (status === PublishStatus.Failure) {
      label =
        this.config.editor.config.labels?.publishFailure || 'Publish error';
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
          this.handlePublishClick(evt);
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

  templatePublishWorkspace(): TemplateResult {
    const modal = this.getOrCreateModalPublish([]);
    const isValid = modal.selective.isValid;
    try {
      return modal.selective.template(modal.selective, modal.data);
    } finally {
      if (isValid !== modal.selective.isValid) {
        this.render();
      }
    }
  }

  templateWorkspace(): TemplateResult {
    const workspace = this.config.state.workspaceOrGetWorkspace();
    const workspaceCommitHash = (workspace?.branch.commit.hash || '...').slice(
      0,
      5
    );
    const workspaceName = workspace?.name || '...';

    return html`<div class="le__part__overview__workspace">
      <strong
        >${workspace?.branch.url
          ? html`<a href="${workspace?.branch.url}" target="_blank"
              >${workspaceName}</a
            >`
          : workspaceName}</strong
      >
      @
      <strong>
        ${workspace?.branch.commit.url
          ? html`<a href="${workspace?.branch.commit.url}" target="_blank"
              >${workspaceCommitHash}</a
            >`
          : workspaceCommitHash}
      </strong>
      by
      <strong>${workspace?.branch.commit.author?.name || '...'}</strong>
      (${workspace?.branch?.commit.timestamp
        ? this.timeAgo.format(
            new Date(workspace?.branch?.commit.timestamp || new Date())
          )
        : '...'})
    </div>`;
  }

  templateIcon(): TemplateResult {
    let icon = html``;
    if (
      this.config.editor.state.project?.source?.source === ProjectSource.GitHub
    ) {
      icon = githubIcon;
    } else if (
      this.config.editor.state.project?.source?.source === ProjectSource.Local
    ) {
      icon = localIcon;
    } else if (
      this.config.editor.state.project?.source?.source === ProjectSource.Example
    ) {
      icon = exampleIcon;
    } else {
      return html``;
    }
    const workspace = this.config.state.workspaceOrGetWorkspace();

    return html`<div
      class="le__part__overview__icon le__tooltip le__tooltip--bottom"
      data-tip=${ifDefined(
        this.config.editor.state.project?.source?.label
          ? this.config.editor.state.project?.source?.label
          : undefined
      )}
    >
      ${workspace?.branch.url
        ? html`<a href="${workspace?.branch.url}" target="_blank">${icon}</a>`
        : icon}
    </div>`;
  }
}
