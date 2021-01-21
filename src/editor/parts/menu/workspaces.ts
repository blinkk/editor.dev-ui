import {DialogActionLevel, DialogModal} from '../../ui/modal';
import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../../..';
import {MenuSectionPart} from './index';

const MODAL_KEY_NEW = 'menu_workspace_new';

export class WorkspacesPart extends MenuSectionPart {
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
        <div class="le__list__item">
          <div class="le__list__item__icon">
            <span class="material-icons">dashboard</span>
          </div>
          <div class="le__list__item__label">main</div>
        </div>
        <div class="le__list__item">
          <div class="le__list__item__icon">
            <span class="material-icons">dashboard</span>
          </div>
          <div class="le__list__item__label">staging</div>
        </div>
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
