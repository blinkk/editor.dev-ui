import {LiveEditor} from './editor';
import {TemplateResult} from '@blinkk/selective-edit';

export interface LiveTemplate {
  (editor: LiveEditor): TemplateResult;
}
