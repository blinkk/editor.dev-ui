import {
  FieldConstructor,
  RuleConstructor,
  SelectiveEditor,
} from '@blinkk/selective-edit';

import {AutoFieldsConstructor} from '@blinkk/selective-edit/dist/selective/autoFields';

export interface ProjectTypeComponent {
  /**
   * Class to use for guessing fields for the project type.
   */
  AutoFieldsCls?: AutoFieldsConstructor;
  /**
   * Type identifier for the projectType component.
   *
   * Value needs to match the projectType in the ProjectData.
   */
  type: string;
  /**
   * Field types unique to the projectType component.
   */
  fieldTypes?: Record<string, FieldConstructor>;
  /**
   * Validation rule types unique to the projectType component.
   */
  ruleTypes?: Record<string, RuleConstructor>;
}

export function updateSelectiveForProjectType(
  projectType: ProjectTypeComponent,
  selective: SelectiveEditor
) {
  selective.addFieldTypes(projectType.fieldTypes || {});
  selective.addRuleTypes(projectType.ruleTypes || {});

  // Check for project type specific autofields class.
  if (projectType && projectType.AutoFieldsCls) {
    selective.types.globals.AutoFieldsCls = projectType.AutoFieldsCls;
  }
}
