import {
  AutocompleteConstructorField,
  ConstructorConfig,
} from '../../generic/field/constructor';
import {
  IncludeExcludeFilter,
  IncludeExcludeFilterConfig,
  escapeRegExp,
} from '../../../utility/filter';
import {AutoCompleteUIItem} from '../../../mixin/autocomplete';
import {FileData} from '../../../editor/api';
import {LiveEditorGlobalConfig} from '../../../editor/editor';
import {StatePromiseKeys} from '../../../editor/state';
import {Types} from '@blinkk/selective-edit';

const VALID_EXTS = ['yaml', 'yml'];

export interface AmagakiYamlConfig extends ConstructorConfig {
  /**
   * Filter to apply for the file list.
   */
  filter?: IncludeExcludeFilterConfig;
}

export class AmagakiYamlField extends AutocompleteConstructorField {
  config: AmagakiYamlConfig;
  filter: IncludeExcludeFilter;
  globalConfig: LiveEditorGlobalConfig;

  constructor(
    types: Types,
    config: AmagakiYamlConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'yaml'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
    this.globalConfig = globalConfig;
    this.type = 'pod.yaml';
    this.filter = new IncludeExcludeFilter({});

    // When there is a query string in the value, it should not show the
    // empty status in the autocomplete because it is valid to not find
    // a match in the autocomplete items.
    this.autoCompleteUi.shouldShowEmpty = (value: string) => {
      const searchValues = VALID_EXTS.map(ext => `.${ext}?`);
      for (const searchValue of searchValues) {
        if (value.includes(searchValue)) {
          return false;
        }
      }
      return true;
    };

    this.initFilter();
    this.initItems();
  }

  /**
   * Function for filtering a list of files to just valid documents.
   *
   * @param fileInfo File information to filter on.
   * @returns True if the file should be retained in the list.
   */
  filterFiles(fileInfo: FileData): boolean {
    return this.filter.matches(fileInfo.path);
  }

  initFilter() {
    // Use the config filter if available.
    if (this.config.filter) {
      this.filter = new IncludeExcludeFilter(this.config.filter);
      return;
    }

    // Default filtering for the field.
    this.filter = new IncludeExcludeFilter({
      includes: [`.*(${VALID_EXTS.join('|')})$`],
      excludes: [
        // Ignore files starting with a period or underscore.
        /\/[._][^/]+$/,
      ],
    });
  }

  initItems() {
    // Check for already loaded files.
    const filteredFiles = (this.globalConfig.state.files || []).filter(
      this.filterFiles.bind(this)
    );
    this.updateItems(filteredFiles);

    // Listen for changes to the files.
    this.globalConfig.state.addListener(StatePromiseKeys.GetFiles, files => {
      const filteredFiles = (files || []).filter(this.filterFiles.bind(this));
      this.updateItems(filteredFiles);
      this.render();
    });

    // Load the files if not loaded.
    this.globalConfig.state.filesOrGetFiles();
  }

  updateItems(documentFiles: Array<FileData>) {
    this.autoCompleteUi.items = documentFiles.map(
      value => new AutoCompleteUIItem(value.path, value.path)
    );

    this.updateValidation(
      documentFiles.map(
        value => new RegExp(`^${escapeRegExp(value.path)}([?].*)?$`)
      ),
      'Yaml path needs to be an existing file.'
    );
  }
}
