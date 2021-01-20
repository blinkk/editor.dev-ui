import {LiveEditor} from './editor';
import {TemplateResult} from 'lit-html';

export interface LiveTemplate {
  (editor: LiveEditor): TemplateResult;
}
