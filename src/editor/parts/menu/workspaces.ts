import {DialogActionLevel, DialogModal} from '../../ui/modal';
import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../../..';
import {MenuSectionPart} from './index';
import {WorkspaceData} from '../../api';
import {repeat} from 'lit-html/directives/repeat';

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
            <div class="le__list__item__label">
              ${workspace.name} @ ${workspace.branch.commit.slice(0, 5)}
            </div>
          </div>`
        )}
      </div>
    </div>`;
  }

  templateNewWorkspace(editor: LiveEditor): TemplateResult {
    return html`...New workspace form...`;
  }

  get title() {
    return 'Workspaces';
  }
}
