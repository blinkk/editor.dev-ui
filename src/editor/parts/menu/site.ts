import {DialogActionLevel, DialogModal} from '../../ui/modal';
import {TemplateResult, html} from 'lit-html';
import {LiveEditor} from '../../..';
import {MenuSectionPart} from './index';

const MODAL_KEY_COPY = 'menu_file_copy';
const MODAL_KEY_DELETE = 'menu_file_delete';
const MODAL_KEY_NEW = 'menu_file_new';

export class SitePart extends MenuSectionPart {
  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__menu__site');
    return classes;
  }

  protected createModalCopy(editor: LiveEditor): DialogModal {
    if (!editor.parts.modals.modals[MODAL_KEY_COPY]) {
      const modal = new DialogModal({
        title: 'Copy file',
      });
      modal.templateModal = this.templateFileCopy.bind(this);
      modal.actions.push({
        label: 'Copy file',
        level: DialogActionLevel.Primary,
        onClick: () => {
          modal.hide();
        },
      });
      modal.addCancelAction();
      editor.parts.modals.modals[MODAL_KEY_COPY] = modal;
    }
    return editor.parts.modals.modals[MODAL_KEY_COPY] as DialogModal;
  }

  protected createModalDelete(editor: LiveEditor): DialogModal {
    if (!editor.parts.modals.modals[MODAL_KEY_DELETE]) {
      const modal = new DialogModal({
        title: 'Delete file',
      });
      modal.templateModal = this.templateFileDelete.bind(this);
      modal.actions.push({
        label: 'Delete file',
        level: DialogActionLevel.Extreme,
        onClick: () => {
          modal.hide();
        },
      });
      modal.addCancelAction();
      editor.parts.modals.modals[MODAL_KEY_DELETE] = modal;
    }
    return editor.parts.modals.modals[MODAL_KEY_DELETE] as DialogModal;
  }

  protected createModalNew(editor: LiveEditor): DialogModal {
    if (!editor.parts.modals.modals[MODAL_KEY_NEW]) {
      const modal = new DialogModal({
        title: 'New file',
      });
      modal.templateModal = this.templateFileNew.bind(this);
      modal.actions.push({
        label: 'Create file',
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
    const handleCopyClick = (evt: Event) => {
      evt.stopPropagation();
      const modal = this.createModalCopy(editor);
      modal.show();
    };
    const handleDeleteClick = (evt: Event) => {
      evt.stopPropagation();
      const modal = this.createModalDelete(editor);
      modal.show();
    };
    const handleNewClick = (evt: Event) => {
      evt.stopPropagation();
      const modal = this.createModalNew(editor);
      modal.show();
    };
    const handleLoadClick = (evt: Event) => {
      evt.stopPropagation();
      console.log('load a path');
    };
    const handleToggleCollectionClick = (evt: Event) => {
      evt.stopPropagation();
      console.log('toggle a collection');
    };
    return html`<div class="le__part__menu__section__content">
      <div class="le__list le__list--indent">
        <div class="le__list__item le__list__item--secondary">
          <div class="le__list__item__icon">
            <span class="material-icons">expand_more</span>
          </div>
          <div class="le__list__item__label">Collections</div>
        </div>
        <div class="le__list">
          <div
            class="le__list__item le__list__item--secondary le__clickable"
            @click=${handleToggleCollectionClick}
          >
            <div class="le__list__item__icon">
              <span class="material-icons">expand_more</span>
            </div>
            <div class="le__list__item__label">pages</div>
          </div>
          <div class="le__list">
            <div
              class="le__list__item le__list__item--primary le__clickable"
              @click=${handleNewClick}
            >
              <div class="le__list__item__icon">
                <span class="material-icons">add_circle</span>
              </div>
              <div class="le__list__item__label">New file</div>
            </div>
            <div
              class="le__list__item le__list__item--selected le__clickable"
              @click=${handleLoadClick}
            >
              <div class="le__list__item__icon">
                <span class="material-icons">notes</span>
              </div>
              <div class="le__list__item__label">index</div>
              <div class="le__actions le__actions--slim">
                <div
                  class="le__actions__action le__clickable le__tooltip--top"
                  @click=${handleCopyClick}
                  data-tip="Duplicate file"
                >
                  <span class="material-icons">file_copy</span>
                </div>
                <div
                  class="le__actions__action le__actions__action--extreme le__clickable le__tooltip--top"
                  @click=${handleDeleteClick}
                  data-tip="Delete file"
                >
                  <span class="material-icons">remove_circle</span>
                </div>
              </div>
            </div>
            <div class="le__list__item le__clickable" @click=${handleLoadClick}>
              <div class="le__list__item__icon">
                <span class="material-icons">notes</span>
              </div>
              <div class="le__list__item__label">about</div>
              <div class="le__actions le__actions--slim">
                <div
                  class="le__actions__action le__clickable le__tooltip--top"
                  @click=${handleCopyClick}
                  data-tip="Duplicate file"
                >
                  <span class="material-icons">file_copy</span>
                </div>
                <div
                  class="le__actions__action le__actions__action--extreme le__clickable le__tooltip--top"
                  @click=${handleDeleteClick}
                  data-tip="Delete file"
                >
                  <span class="material-icons">remove_circle</span>
                </div>
              </div>
            </div>
          </div>
          <div
            class="le__list__item le__list__item--secondary le__clickable"
            @click=${handleToggleCollectionClick}
          >
            <div class="le__list__item__icon">
              <span class="material-icons">chevron_right</span>
            </div>
            <div class="le__list__item__label">strings</div>
          </div>
        </div>
      </div>
    </div>`;
  }

  templateFileCopy(editor: LiveEditor): TemplateResult {
    return html`...Copy file form...`;
  }

  templateFileDelete(editor: LiveEditor): TemplateResult {
    return html`...Delete file form...`;
  }

  templateFileNew(editor: LiveEditor): TemplateResult {
    return html`...New file form...`;
  }

  get title() {
    return 'Site';
  }
}
