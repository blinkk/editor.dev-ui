import {ApiError, WorkspaceData} from '../../api';
import {DeepObject, TemplateResult, html} from '@blinkk/selective-edit';
import {DialogActionLevel, FormDialogModal} from '../../ui/modal';
import {EVENT_WORKSPACE_LOAD} from '../../events';
import {LiveEditor} from '../../editor';
import {MenuSectionPart} from './index';
import merge from 'lodash.merge';
import {repeat} from '@blinkk/selective-edit';

const MODAL_KEY_NEW = 'menu_workspace_new';

export class WorkspacesPart extends MenuSectionPart {
  workspace?: WorkspaceData;
  workspacePromise?: Promise<WorkspaceData>;
  workspaces?: Array<WorkspaceData>;
  workspacesPromise?: Promise<Array<WorkspaceData>>;

  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__menu__workspaces');
    return classes;
  }

  protected getOrCreateModalNew(editor: LiveEditor): FormDialogModal {
    if (!editor.parts.modals.modals[MODAL_KEY_NEW]) {
      // Setup the editor.
      const options = [];
      for (const workspace of this.workspaces || []) {
        options.push({
          label: workspace.name,
          value: workspace.branch.name,
        });
      }

      const selectiveConfig = merge(
        {
          fields: [
            {
              type: 'select',
              key: 'base',
              label: 'Parent workspace',
              help: 'Workspace to start the new workspace from.',
              options: options,
              validation: [
                {
                  type: 'require',
                  message: 'Parent workspace is required.',
                },
              ],
            },
            {
              type: 'text',
              key: 'workspace',
              label: 'New workspace name',
              help: 'Used for the workspace url and the git branch.',
              validation: [
                {
                  type: 'require',
                  message: 'Workspace name is required.',
                },
                {
                  type: 'pattern',
                  pattern: '^[a-z0-9-]*$',
                  message:
                    'Workspace name can only contain lowercase alpha-numeric characters and - (dash).',
                },
                {
                  type: 'match',
                  excluded: {
                    values: ['main', 'master', 'staging'],
                    message:
                      'Workspace name cannot be "main", "master", or "staging".',
                  },
                },
              ],
            },
          ],
        },
        editor.config.selectiveConfig
      );
      const modal = new FormDialogModal({
        title: 'New workspace',
        selectiveConfig: selectiveConfig,
      });
      modal.templateModal = this.templateNewWorkspace.bind(this);
      modal.actions.push({
        label: 'Create workspace',
        level: DialogActionLevel.Primary,
        isDisabledFunc: () => {
          return modal.isProcessing || !modal.selective.isValid;
        },
        onClick: () => {
          const value = modal.selective.value;
          modal.startProcessing();

          // Find the full workspace information for the base workspace.
          let baseWorkspace: WorkspaceData | undefined = undefined;
          for (const workspace of this.workspaces || []) {
            if (workspace.branch.name === value.base) {
              baseWorkspace = workspace;
            }
          }

          if (!baseWorkspace) {
            modal.error = {
              message: `Unable to find the base workspace information for '${value.base}'`,
            };
            modal.stopProcessing();
            return;
          }

          this.config.api
            .createWorkspace(baseWorkspace, value.workspace)
            .then((newWorkspace: WorkspaceData) => {
              // Log the success to the notifications.
              editor.parts.notifications.addInfo({
                message: `New '${newWorkspace.name}' workspace successfully created.`,
                actions: [
                  {
                    label: 'Visit workspace',
                    customEvent: EVENT_WORKSPACE_LOAD,
                    details: newWorkspace,
                  },
                ],
              });
              // Reset the data for the next time the form is shown.
              modal.data = new DeepObject();
              modal.stopProcessing(true);
            })
            .catch((error: ApiError) => {
              // Log the error to the notifications.
              editor.parts.notifications.addError(error);
              modal.error = error;
              modal.stopProcessing();
            });
        },
      });
      modal.addCancelAction();
      editor.parts.modals.modals[MODAL_KEY_NEW] = modal;
    }
    return editor.parts.modals.modals[MODAL_KEY_NEW] as FormDialogModal;
  }

  templateContent(editor: LiveEditor): TemplateResult {
    // Lazy load the workspace information.
    if (!this.workspace && !this.workspacePromise) {
      this.workspacePromise = this.config.api.getWorkspace();
      this.workspacePromise.then(data => {
        this.workspace = data;
        this.workspacePromise = undefined;
        this.render();
      });
    }

    // Lazy load the workspaces information.
    if (!this.workspaces && !this.workspacesPromise) {
      this.workspacesPromise = this.config.api.getWorkspaces();
      this.workspacesPromise.then(data => {
        this.workspaces = data;
        this.workspacesPromise = undefined;
        this.render();
      });
    }

    if (!this.workspaces) {
      return html`<div class="le__loading le__loading--pad"></div>`;
    }

    const handleClick = () => {
      const modal = this.getOrCreateModalNew(editor);
      modal.show();
    };

    return html`<div class="le__part__menu__section__content">
      <div class="le__list le__list--constrained le__list--indent">
        <div
          class="le__list__item le__list__item--primary le__clickable"
          @click=${handleClick}
        >
          <div class="le__list__item__icon">
            <span class="material-icons">add_circle</span>
          </div>
          <div class="le__list__item__label">Add workspace</div>
        </div>
        ${repeat(
          this.workspaces || [],
          workspace => workspace.name,
          workspace => html`<div
            class="le__list__item ${this.workspace?.name === workspace.name
              ? 'le__list__item--selected'
              : ''}"
          >
            <div class="le__list__item__icon">
              <span class="material-icons">dashboard</span>
            </div>
            <div class="le__list__item__label">${workspace.name}</div>
          </div>`
        )}
      </div>
    </div>`;
  }

  templateNewWorkspace(editor: LiveEditor): TemplateResult {
    const modal = this.getOrCreateModalNew(editor);
    return modal.selective.template(modal.selective, modal.data);
  }

  get title() {
    return 'Workspaces';
  }
}
