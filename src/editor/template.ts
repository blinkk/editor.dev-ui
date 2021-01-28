import {TemplateResult, classMap, html} from '@blinkk/selective-edit';
import {LiveEditor} from './editor';

export interface LiveTemplate {
  (editor: LiveEditor): TemplateResult;
}

export interface TemplateOptions {
  pad?: boolean;
  padHorizontal?: boolean;
  padVertical?: boolean;
}

export function templateLoading(
  editor: LiveEditor,
  options?: TemplateOptions
): TemplateResult {
  const classes = {
    le__loading: true,
    'le__loading--pad': options?.pad || false,
    'le__loading--pad-horizontal': options?.padHorizontal || false,
    'le__loading--pad-vertical': options?.padVertical || false,
  };

  return html`<div class=${classMap(classes)}></div>`;
}
