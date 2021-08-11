import {TemplateResult, classMap, html} from '@blinkk/selective-edit';

import {ProjectSource} from './api';

export interface LiveTemplate {
  (): TemplateResult;
}

export interface TemplateOptions {
  pad?: boolean;
  padHorizontal?: boolean;
  padVertical?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function templateError(message?: TemplateResult): TemplateResult {
  return templateMessage('error', message);
}

export function templateInfo(message?: TemplateResult): TemplateResult {
  return templateMessage('info', message);
}

export function templateWarning(message?: TemplateResult): TemplateResult {
  return templateMessage('warning', message);
}

export function templateMessage(
  messageType: 'info' | 'warning' | 'error',
  message?: TemplateResult,
  icon?: string
): TemplateResult {
  const classes: Record<string, boolean> = {};
  classes[`le__${messageType}`] = true;

  return html`<div class=${classMap(classes)}>
    <div class="le__${messageType}__icon">
      <span class="material-icons">${icon || messageType}</span>
    </div>
    <div class="le__${messageType}__message">${message}</div>
  </div>`;
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

/**
 * Custom labels for the editor UI.
 */
export interface LiveEditorLabels {
  /**
   * Label for content save action.
   */
  contentSave?: string;
  /**
   * Label for content save action clean state.
   */
  contentSaveClean?: string;
  /**
   * Label for content save action processing.
   */
  contentSaveErrors?: string;
  /**
   * Label for content save action processing.
   */
  contentSaveProcessing?: string;
  /**
   * Label for media field extra fields.
   */
  fieldMediaExtra?: string;
  /**
   * Label for media field sub fields.
   */
  fieldMediaFields?: string;
  /**
   * Label for media field label.
   */
  fieldMediaLabel?: string;
  /**
   * Label for media field path.
   */
  fieldMediaPath?: string;
  /**
   * Label for media field preview.
   */
  fieldMediaPreview?: string;
  /**
   * Label for the file.
   */
  file?: string;
  /**
   * Label for action to create new file.
   */
  fileNew?: string;
  /**
   * Label for the files structure.
   */
  files?: string;
  /**
   * Label for the site section of the menu.
   */
  menuSite?: string;
  /**
   * Label for the users section of the menu.
   */
  menuUsers?: string;
  /**
   * Label for the workspaces section of the menu.
   */
  menuWorkspaces?: string;
  /**
   * Label for publishing when a publish has been completed.
   */
  publishComplete?: string;
  /**
   * Label for publishing when a publish has failed.
   */
  publishFailure?: string;
  /**
   * Submit button label for the publish modal window.
   */
  publishModalSubmit?: string;
  /**
   * Title for the publish modal window.
   */
  publishModalTitle?: string;
  /**
   * Label for publishing when there are not changes to publish.
   */
  publishNoChanges?: string;
  /**
   * Label for publishing when a publish is not allowed.
   */
  publishNotAllowed?: string;
  /**
   * Label for publishing when a publish has not been started.
   */
  publishNotStarted?: string;
  /**
   * Label for publishing when a publish is in progress.
   */
  publishPending?: string;
  /**
   * Label for the workspace.
   */
  workspace?: string;
  /**
   * Label for the action to create a new workspace.
   */
  workspaceNew?: string;
  /**
   * Label for the workspace.
   */
  workspaces?: string;
}

/**
 * Allow keyboard events for clicking on an element.
 *
 * @param evt keyboard event
 */
export function handleKeyboardNav(evt: KeyboardEvent) {
  if (evt.key === 'Enter' || evt.key === ' ') {
    (evt.target as HTMLElement).click();
  }
}

/**
 * Do not want to have normal link clicks redirect, but still want
 * links to be able to be opened in a new tab.
 */
export function preventNormalLinks(evt: KeyboardEvent) {
  if (evt.ctrlKey || evt.shiftKey || evt.metaKey) {
    // Stop the upstream click handler from triggering.
    evt.stopPropagation();
    return;
  }
  evt.preventDefault();
}

/**
 * Determine the correct base url to use for the project.
 *
 * @param source Source when available.
 * @returns Base url for the given source.
 */
export function getBaseUrlForSource(source?: ProjectSource | string): string {
  if (source === ProjectSource.Local) {
    return '/';
  }
  if (source === ProjectSource.GitHub) {
    return '/gh/';
  }
  return '/';
}
