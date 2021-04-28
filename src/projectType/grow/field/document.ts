import {
  ConstructorConfig,
  ConstructorField,
} from '../../generic/field/constructor';
import {AutoCompleteUIItem} from '../../../mixin/autocomplete';
import {FileData} from '../../../editor/api';
import {IncludeExcludeFilterConfig} from '../../../utility/filter';
import {LiveEditorGlobalConfig} from '../../../editor/editor';
import {Types} from '@blinkk/selective-edit';

const VALID_DOC_EXTS = ['.yaml', '.md', '.html'];
const IGNORED_DOC_PREFIX = ['_', '.'];

export interface GrowDocumentConfig extends ConstructorConfig {
  /**
   * Filter to apply for the file list.
   */
  filter?: IncludeExcludeFilterConfig;
}

export class GrowDocumentField extends ConstructorField {
  config: GrowDocumentConfig;
  globalConfig: LiveEditorGlobalConfig;

  constructor(
    types: Types,
    config: GrowDocumentConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'document'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
    this.globalConfig = globalConfig;
    this.tag = '!g.doc';

    this.initItems();
  }

  /**
   * Function for filtering a list of files to just valid documents.
   *
   * @param fileInfo File information to filber on.
   * @returns True if the file should be retained in the list.
   */
  filterFiles(fileInfo: FileData): boolean {
    // Needs to be in content directory.
    if (!fileInfo.path.startsWith('/content/')) {
      return false;
    }

    // Needs to have a valid doc extension.
    let hasValidExt = false;
    for (const ext of VALID_DOC_EXTS) {
      if (fileInfo.path.endsWith(ext)) {
        hasValidExt = true;
        break;
      }
    }
    if (!hasValidExt) {
      return false;
    }

    // Filename cannot start with ignored characters.
    const pathParts = fileInfo.path.split('/');
    const filename = pathParts[pathParts.length - 1];
    for (const prefix of IGNORED_DOC_PREFIX) {
      if (filename.startsWith(prefix)) {
        return false;
      }
    }

    return true;
  }

  initItems() {
    // Check for already loaded files.
    const documentFiles = (this.globalConfig.state.files || []).filter(
      this.filterFiles
    );
    this.updateItems(documentFiles);

    // Listen for changes to the files.
    this.globalConfig.state.addListener('getFiles', files => {
      const documentFiles = (files || []).filter(this.filterFiles);
      this.updateItems(documentFiles);
      this.render();
    });

    // Load the files if not loaded.
    if (this.globalConfig.state.files === undefined) {
      this.globalConfig.state.getFiles();
    }
  }

  updateItems(documentFiles: Array<FileData>) {
    this.autoCompleteUi.items = documentFiles.map(
      value => new AutoCompleteUIItem(value.path, value.path)
    );
  }
}
