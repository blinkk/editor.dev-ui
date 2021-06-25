import {FieldConstructor, RuleConstructor} from '@blinkk/selective-edit';

export interface ProjectTypeComponent {
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
