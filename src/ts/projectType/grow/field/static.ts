import {
  AutocompleteConstructorField,
  ConstructorConfig,
} from '../../generic/field/constructor';
import {
  IncludeExcludeFilter,
  IncludeExcludeFilterConfig,
} from '../../../utility/filter';
import {AutoCompleteUIItem} from '../../../mixin/autocomplete';
import {FileData} from '../../../editor/api';
import {LiveEditorGlobalConfig} from '../../../editor/editor';
import {StatePromiseKeys} from '../../../editor/state';
import {Types} from '@blinkk/selective-edit';

export interface GrowStaticConfig extends ConstructorConfig {
  /**
   * Filter to apply for the file list.
   */
  filter?: IncludeExcludeFilterConfig;
}

export class GrowStaticField extends AutocompleteConstructorField {
  config: GrowStaticConfig;
  filter: IncludeExcludeFilter;
  globalConfig: LiveEditorGlobalConfig;

  constructor(
    types: Types,
    config: GrowStaticConfig,
    globalConfig: LiveEditorGlobalConfig,
    fieldType = 'document'
  ) {
    super(types, config, globalConfig, fieldType);
    this.config = config;
    this.globalConfig = globalConfig;
    this.type = 'g.static';
    this.filter = new IncludeExcludeFilter({});

    this.initFilter();
    this.initItems();
  }

  /**
   * Function for filtering a list of files to just valid documents.
   *
   * @param fileInfo File information to filber on.
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
      includes: [
        // Needs to be in a `/static/` directory.
        /\/static\//,
      ],
      excludes: [
        // Ignore files starting with a period or underscore.
        /\/[._][^\/]+$/,
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

  updateItems(filteredFiles: Array<FileData>) {
    this.autoCompleteUi.items = filteredFiles.map(
      value => new AutoCompleteUIItem(value.path, value.path)
    );

    this.updateValidation(
      filteredFiles.map(value => value.path),
      'Static file path needs to be an existing file.'
    );
  }
}
