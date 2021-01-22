import {DeepObject, TemplateResult, html} from '@blinkk/selective-edit';
import {DialogActionLevel, DialogModal} from '../../ui/modal';
import {LiveEditor} from '../../..';
import {MenuSectionPart} from './index';
import {SelectiveEditor} from '@blinkk/selective-edit';
import {WorkspaceData} from '../../api';
import merge from 'lodash.merge';
import {repeat} from '@blinkk/selective-edit';

const MODAL_KEY_NEW = 'menu_workspace_new';

export class WorkspacesPart extends MenuSectionPart {
  dataNew?: DeepObject;
  workspace?: WorkspaceData;
  workspacePromise?: Promise<WorkspaceData>;
  workspaces?: Array<WorkspaceData>;
  workspacesPromise?: Promise<Array<WorkspaceData>>;
  selectiveNew?: SelectiveEditor;

  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__menu__workspaces');
    return classes;
  }

  protected createModalNew(editor: LiveEditor): DialogModal {
    if (!editor.parts.modals.modals[MODAL_KEY_NEW]) {
      const modal = new DialogModal({
        title: 'New workspace',
      });
      modal.templateModal = this.templateNewWorkspace.bind(this);
      modal.actions.push({
        label: 'Create workspace',
        level: DialogActionLevel.Primary,
        onClick: () => {
          modal.hide();
        },
      });
      modal.addCancelAction();

      const options = [];
      for (const workspace of this.workspaces || []) {
        options.push({
          label: workspace.name,
          value: workspace.branch.name,
        });
      }

      // Setup the editor.
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
                  type: 'required',
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
                  type: 'required',
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
      this.selectiveNew = new SelectiveEditor(selectiveConfig);
      this.dataNew = new DeepObject({});

      editor.parts.modals.modals[MODAL_KEY_NEW] = modal;
    }
    return editor.parts.modals.modals[MODAL_KEY_NEW] as DialogModal;
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
      const modal = this.createModalNew(editor);
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
    if (!this.selectiveNew || !this.dataNew) {
      return html``;
    }
    return this.selectiveNew?.template(this.selectiveNew, this.dataNew);
  }

  get title() {
    return 'Workspaces';
  }
}
