import {ApiError, FileData} from '../../api';
import {DialogActionLevel, DialogModal, FormDialogModal} from '../../ui/modal';
import {TemplateResult, html} from '@blinkk/selective-edit';
import {EVENT_FILE_LOAD} from '../../events';
import {LiveEditor} from '../../..';
import {MenuSectionPart} from './index';
import merge from 'lodash.merge';
import {repeat} from '@blinkk/selective-edit';

const MODAL_KEY_COPY = 'menu_file_copy';
const MODAL_KEY_DELETE = 'menu_file_delete';
const MODAL_KEY_NEW = 'menu_file_new';

interface DirectoryEventHandlers {
  fileCopy: (evt: Event) => void;
  fileDelete: (evt: Event) => void;
  fileLoad: (evt: Event) => void;
  fileNew: (evt: Event) => void;
  render: () => void;
}

export class SitePart extends MenuSectionPart {
  files?: Array<FileData>;
  filesPromise?: Promise<Array<FileData>>;
  fileStructure?: DirectoryStructure;

  classesForPart(): Array<string> {
    const classes = super.classesForPart();
    classes.push('le__part__menu__site');
    return classes;
  }

  protected getOrCreateModalCopy(editor: LiveEditor): FormDialogModal {
    if (!editor.parts.modals.modals[MODAL_KEY_COPY]) {
      const selectiveConfig = merge(
        {
          fields: [
            {
              type: 'text',
              key: 'fileName',
              label: 'File name',
              // TODO: Full in the original file name.
              help: "Copy '...' to this new file.",
              validation: [
                {
                  type: 'require',
                  message: 'File name is required.',
                },
                {
                  type: 'pattern',
                  pattern: '^[a-z0-9-_./]*$',
                  message:
                    'File name can only contain lowercase alpha-numeric characters, . (period), _ (underscore), / (forward slash), and - (dash).',
                },
                {
                  type: 'pattern',
                  pattern: '/[a-z0-9]+[a-z0-9-_./]*$',
                  message:
                    'File name in the sub directory needs to start with alpha-numeric characters.',
                },
                {
                  type: 'pattern',
                  pattern: '^/content/[a-z0-9]+/',
                  message:
                    'File name needs to be in a collection (ex: /content/pages/).',
                },
                // TODO: Extension matching.
                // {
                //   type: 'pattern',
                //   pattern: `^.*\.(${originalExt})$`,
                //   message: `File name needs to end with ".${originalExt}" to match the original file.`,
                // },
                // TODO: File match checking.
                // {
                //   type: 'match',
                //   excluded: {
                //     values: [podPath],
                //     message: 'Cannot copy to the same file.',
                //   },
                // },
                // {
                //   type: 'match',
                //   level: 'warning',
                //   excluded: {
                //     values: otherPodPaths,
                //     message:
                //       'File name already exists. Copying will overwrite the existing file.',
                //   },
                // },
              ],
            },
          ],
        },
        editor.config.selectiveConfig
      );
      const modal = new FormDialogModal({
        title: 'Copy file',
        selectiveConfig: selectiveConfig,
      });
      modal.templateModal = this.templateFileCopy.bind(this);
      modal.actions.push({
        label: 'Copy file',
        level: DialogActionLevel.Primary,
        isDisabledFunc: () => {
          return modal.isProcessing || !modal.selective.isValid;
        },
        onClick: () => {
          // TODO: Add form processing.
          modal.hide();
        },
      });
      modal.addCancelAction();
      editor.parts.modals.modals[MODAL_KEY_COPY] = modal;
    }
    return editor.parts.modals.modals[MODAL_KEY_COPY] as FormDialogModal;
  }

  protected getOrCreateModalDelete(editor: LiveEditor): DialogModal {
    if (!editor.parts.modals.modals[MODAL_KEY_DELETE]) {
      const modal = new DialogModal({
        title: 'Delete file',
      });
      modal.templateModal = this.templateFileDelete.bind(this);
      modal.actions.push({
        label: 'Delete file',
        level: DialogActionLevel.Extreme,
        isDisabledFunc: () => false,
        onClick: () => {
          // TODO: Add api call to delete.
          modal.hide();
        },
      });
      modal.addCancelAction();
      editor.parts.modals.modals[MODAL_KEY_DELETE] = modal;
    }
    return editor.parts.modals.modals[MODAL_KEY_DELETE] as FormDialogModal;
  }

  protected getOrCreateModalNew(editor: LiveEditor): FormDialogModal {
    const selectiveConfig = merge(
      {
        fields: [
          {
            type: 'text',
            key: 'fileName',
            label: 'File name',
            help: 'May also be used for the url stub.',
            validation: [
              {
                type: 'require',
                message: 'File name is required.',
              },
              {
                type: 'pattern',
                pattern: '^[a-z0-9-_./]*$',
                message:
                  'File name can only contain lowercase alpha-numeric characters, . (period), _ (underscore), / (forward slash), and - (dash).',
              },
              {
                type: 'pattern',
                pattern: '^[a-z0-9]+',
                message:
                  'File name can only start with an alpha-numeric character.',
              },
              {
                type: 'pattern',
                pattern: '^.*.(yaml|md|html)$',
                message:
                  'File name needs to end with ".yaml", ".md", or ".html".',
              },
            ],
          },
        ],
      },
      editor.config.selectiveConfig
    );
    if (!editor.parts.modals.modals[MODAL_KEY_NEW]) {
      const modal = new FormDialogModal({
        title: 'New file',
        selectiveConfig: selectiveConfig,
      });
      modal.templateModal = this.templateFileNew.bind(this);
      modal.actions.push({
        label: 'Create file',
        level: DialogActionLevel.Primary,
        isDisabledFunc: () => {
          return modal.isProcessing || !modal.selective.isValid;
        },
        onClick: () => {
          const value = modal.selective.value;
          modal.startProcessing();

          this.config.api
            .createFile(value.fileName)
            .then((newFile: FileData) => {
              // Log the success to the notifications.
              editor.parts.notifications.addInfo({
                message: `New '${
                  newFile.shortcutPath || newFile.path
                }' file successfully created.`,
                actions: [
                  {
                    label: 'Visit file',
                    customEvent: EVENT_FILE_LOAD,
                    details: newFile,
                  },
                ],
              });
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
    // Lazy load the workspaces information.
    if (!this.files && !this.filesPromise) {
      this.filesPromise = this.config.api.getFiles();
      this.filesPromise.then(data => {
        this.files = data;
        this.filesPromise = undefined;
        this.render();
      });
    }

    if (!this.files) {
      return html`<div class="le__loading le__loading--pad"></div>`;
    }

    if (!this.fileStructure) {
      const eventHandlers: DirectoryEventHandlers = {
        fileCopy: (evt: Event) => {
          evt.stopPropagation();
          const modal = this.getOrCreateModalCopy(editor);
          modal.show();
        },
        fileDelete: (evt: Event) => {
          evt.stopPropagation();
          const modal = this.getOrCreateModalDelete(editor);
          modal.show();
        },
        fileLoad: (evt: Event) => {
          evt.stopPropagation();
          console.log('load a path');
        },
        fileNew: (evt: Event) => {
          evt.stopPropagation();
          const modal = this.getOrCreateModalNew(editor);
          modal.show();
        },
        render: this.render.bind(this),
      };

      this.fileStructure = new DirectoryStructure(this.files, eventHandlers);
    }

    return html`<div class="le__part__menu__section__content">
      <div class="le__list le__list--indent">
        <div class="le__list__item le__list__item--heading">
          <div class="le__list__item__icon">
            <span class="material-icons">folder</span>
          </div>
          <div class="le__list__item__label">Files</div>
        </div>
        ${this.fileStructure.template(editor)}
      </div>
    </div>`;
  }

  templateFileCopy(editor: LiveEditor): TemplateResult {
    const modal = this.getOrCreateModalCopy(editor);
    return modal.selective.template(modal.selective, modal.data);
  }

  templateFileDelete(editor: LiveEditor): TemplateResult {
    return html`...Delete file info...`;
  }

  templateFileNew(editor: LiveEditor): TemplateResult {
    const modal = this.getOrCreateModalNew(editor);
    return modal.selective.template(modal.selective, modal.data);
  }

  get title() {
    return 'Site';
  }
}

class DirectoryStructure {
  rootFiles: Array<FileData>;
  root: string;
  directories: Record<string, DirectoryStructure>;
  eventHandlers: DirectoryEventHandlers;
  files: Array<FileData>;
  isExpanded?: boolean;

  constructor(
    rootFiles: Array<FileData>,
    eventHandlers: DirectoryEventHandlers,
    root = '/'
  ) {
    this.rootFiles = rootFiles;
    this.root = root;
    this.eventHandlers = eventHandlers;
    this.directories = {};
    this.files = [];

    if (this.root === '/') {
      this.isExpanded = true;
    }

    for (const fileData of this.rootFiles) {
      const relativePath = (fileData.shortcutPath || fileData.path).slice(
        this.root.length
      );
      const pathParts = relativePath.split('/');
      // Directories have more segments.
      // First segment is empty string since it starts with /.
      if (pathParts.length > 1) {
        const directoryName = pathParts[0];
        if (!this.directories[directoryName]) {
          const subDirectoryRoot = `${this.root}${directoryName}/`;
          const subFiles = this.rootFiles.filter(fileData => {
            return (fileData.shortcutPath || fileData.path).startsWith(
              subDirectoryRoot
            );
          });
          this.directories[directoryName] = new DirectoryStructure(
            subFiles,
            this.eventHandlers,
            subDirectoryRoot
          );
        }
      } else {
        this.files.push(fileData);
      }
    }
  }

  get base(): string {
    const trimmedRoot = this.root.replace(/\/+/g, '').replace(/\/+$/g, '');
    const rootParts = trimmedRoot.split('/');
    return rootParts[rootParts.length - 1];
  }

  baseFromFilePath(file: FileData) {
    const pathParts = file.path.split('/');
    const fileParts = pathParts[pathParts.length - 1].split('.');
    return fileParts.slice(0, -1).join('.');
  }

  expandToFile(fileData: FileData) {
    // TODO: Expand out all directories to get to the file.
  }

  handleExpandCollapse() {
    this.isExpanded = !this.isExpanded;
    this.eventHandlers.render();
  }

  template(editor: LiveEditor): TemplateResult {
    if (!this.isExpanded) {
      return html``;
    }

    return html`${this.templateDirectories(editor)}
    ${this.templateFiles(editor)}`;
  }

  templateDirectories(editor: LiveEditor): TemplateResult {
    if (!this.directories) {
      return html``;
    }

    return html`<div class="le__list">
      ${repeat(
        Object.keys(this.directories),
        (key: string) => key,
        (key: string) => html`<div
            class="le__list__item le__list__item--secondary le__clickable"
            @click=${this.directories[key].handleExpandCollapse.bind(
              this.directories[key]
            )}
          >
            <div class="le__list__item__icon">
              <span class="material-icons"
                >${this.directories[key].isExpanded
                  ? 'expand_more'
                  : 'chevron_right'}</span
              >
            </div>
            <div class="le__list__item__label">
              ${this.directories[key].base}
            </div>
          </div>
          ${this.directories[key].template(editor)}`
      )}
    </div>`;
  }

  templateFiles(editor: LiveEditor): TemplateResult {
    if (!this.files || !this.files.length) {
      return html``;
    }

    // TODO: Add selected if matches the current document.
    // le__list__item--selected

    return html`<div class="le__list">
      <div
        class="le__list__item le__list__item--primary le__clickable"
        @click=${this.eventHandlers.fileNew}
      >
        <div class="le__list__item__icon">
          <span class="material-icons">add_circle</span>
        </div>
        <div class="le__list__item__label">New file</div>
      </div>
      ${repeat(
        this.files,
        (file: FileData) => file.path,
        (file: FileData) => html`<div
          class="le__list__item le__clickable"
          @click=${this.eventHandlers.fileLoad}
        >
          <div class="le__list__item__icon">
            <span class="material-icons">notes</span>
          </div>
          <div class="le__list__item__label">
            ${this.baseFromFilePath(file)}
          </div>
          <div class="le__actions le__actions--slim">
            <div
              class="le__actions__action le__clickable le__tooltip--top"
              @click=${this.eventHandlers.fileCopy}
              data-tip="Duplicate file"
            >
              <span class="material-icons">file_copy</span>
            </div>
            <div
              class="le__actions__action le__actions__action--extreme le__clickable le__tooltip--top"
              @click=${this.eventHandlers.fileDelete}
              data-tip="Delete file"
            >
              <span class="material-icons">remove_circle</span>
            </div>
          </div>
        </div>`
      )}
    </div>`;
  }
}
