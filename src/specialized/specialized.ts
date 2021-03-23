import {FieldConstructor, RuleConstructor} from '@blinkk/selective-edit';

export interface SpecializedComponent {
  /**
   * Type identifier for the specialized component.
   *
   * Value needs to match the specialization in the ProjectData.
   */
  type: string;
  /**
   * Field types unique to the specialized component.
   */
  fieldTypes?: Record<string, FieldConstructor>;
  /**
   * Validation rule types unique to the specialized component.
   */
  ruleTypes?: Record<string, RuleConstructor>;
}
