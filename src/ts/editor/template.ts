import {TemplateResult, classMap, html} from '@blinkk/selective-edit';
import {LiveEditor} from './editor';

export interface LiveTemplate {
  (editor: LiveEditor): TemplateResult;
}

export interface TemplateOptions {
  pad?: boolean;
  padHorizontal?: boolean;
  padVertical?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function templateLoading(
  options?: TemplateOptions,
  message?: TemplateResult
): TemplateResult {
  const classes = {
    le__loading: true,
    'le__loading--pad': options?.pad || false,
    'le__loading--pad-horizontal': options?.padHorizontal || false,
    'le__loading--pad-vertical': options?.padVertical || false,
    'le__loading--small': options?.size === 'small',
    'le__loading--large': options?.size === 'large',
  };

  if (message) {
    return html`<div class="le__loading__container">
      <div class=${classMap(classes)}></div>
      ${message}
    </div>`;
  }
  return html`<div class=${classMap(classes)}></div>`;
}
