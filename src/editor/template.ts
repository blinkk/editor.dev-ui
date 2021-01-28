import {TemplateResult, expandClasses, html} from '@blinkk/selective-edit';
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
  const classes = ['le__loading'];

  if (options?.pad) {
    classes.push('le__loading--pad');
  }

  if (options?.padHorizontal) {
    classes.push('le__loading--pad-horizontal');
  }

  if (options?.padVertical) {
    classes.push('le__loading--pad-vertical');
  }

  return html`<div class=${expandClasses(classes)}></div>`;
}
