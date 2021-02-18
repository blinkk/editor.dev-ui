/**
 * Custom event name for loading a file in the editor.
 *
 * Expects a {@link FileData} as the event details.
 */
export const EVENT_FILE_LOAD = 'live.file.load';

/**
 * Custom event name for finished a file load in the editor.
 */
export const EVENT_FILE_LOAD_COMPLETE = 'live.file.load.complete';

/**
 * Custom event name for adding a notification.
 *
 * Expects a {@link EditorNotification} as the event details.
 */
export const EVENT_NOTIFICATION_ADD = 'live.notification.add';

/**
 * Custom event name for marking a notification as read.
 *
 * Expects a {@link EditorNotification} as the event details.
 */
export const EVENT_NOTIFICATION_READ = 'live.notification.read';

/**
 * Custom event name for opening a notification.
 *
 * Expects a {@link EditorNotification} as the event details.
 */
export const EVENT_NOTIFICATION_SHOW = 'live.notification.show';

/**
 * Custom event name for triggering a render.
 */
export const EVENT_RENDER = 'live.render';

/**
 * Custom event after a render completes.
 */
export const EVENT_RENDER_COMPLETE = 'live.render.complete';

/**
 * Custom event name for opening a toast.
 *
 * Expects a {@link ToastConfig} as the event details.
 */
export const EVENT_TOAST_SHOW = 'live.toast.show';

/**
 * Custom event for loading a workspace.
 *
 * Expects a {@link WorkspaceData} as the event details.
 */
export const EVENT_WORKSPACE_LOAD = 'live.workspace.load';
