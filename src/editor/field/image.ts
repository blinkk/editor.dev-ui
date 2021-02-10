import {
  DeepObject,
  DroppableMixin,
  Field,
  FieldComponent,
  FieldConfig,
  SelectiveEditor,
  TemplateResult,
  Types,
  classMap,
  html,
} from '@blinkk/selective-edit';
import {FileData} from '../api';
import {LiveEditorGlobalConfig} from '../editor';

export interface ImageFieldConfig extends FieldConfig {
  /**
   * Placeholder for the text input.
   */
  placeholder?: string;
}

export interface ImageFieldComponent extends FieldComponent {
  handleFiles(files: Array<File>): void;
}

export class ImageField
  extends DroppableMixin(Field)
  implements ImageFieldComponent {
  config: ImageFieldConfig;
  globalConfig: LiveEditorGlobalConfig;

  constructor(
    types: Types,
    config: ImageFieldConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'image'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
    this.globalConfig = globalConfig;
    this.droppableUi.listeners.add('files', this.handleFiles.bind(this));
  }

  handleFiles(files: Array<File>) {
    // TODO: Check the file type against the valid types for the field.

    // Uploads only the first valid file.
    this.globalConfig.api.uploadFile(files[0]).then((file: FileData) => {
      console.log('Uploaded file', file);

      this.render();
    });
  }

  templateInput(editor: SelectiveEditor, data: DeepObject): TemplateResult {
    const value = this.currentValue || '';
    return html`${this.templateHelp(editor, data)}
      <div
        class="selective__droppable__target"
        @dragenter=${this.droppableUi.handleDragEnter.bind(this.droppableUi)}
        @dragleave=${this.droppableUi.handleDragLeave.bind(this.droppableUi)}
        @dragover=${this.droppableUi.handleDragOver.bind(this.droppableUi)}
        @drop=${this.droppableUi.handleDrop.bind(this.droppableUi)}
      >
        <input
          class=${classMap(this.classesForInput())}
          type="text"
          id="${this.uid}"
          placeholder=${this.config.placeholder || ''}
          @input=${this.handleInput.bind(this)}
          value=${value}
        />
      </div>
      ${this.templateErrors(editor, data)}`;
  }
}
