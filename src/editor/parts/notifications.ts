import {BasePart, Part} from '.';
import {TemplateResult, html} from '@blinkk/selective-edit';
import {EVENT_NOTIFICATION} from '../events';
import {LiveEditor} from '../editor';

export enum NotificationLevel {
  Debug,
  Info,
  Warning,
  Error,
}

/**
 * Announcements can define actions that are available to the user.
 * These will appear as options for when the user views the notification
 * such as in a toast, a modal window, or the notifications view.
 *
 * For security cannot provide a callback, instead triggers a
 * custom event that contains additional details.
 */
export interface NotificationAction {
  label: string;
  customEvent: string;
  details?: Record<string, any>;
}

/**
 * When events or actions take place in the editor notifications
 * can be displayed to the user, often as a toast or for more
 * serious issues a modal window.
 *
 * Notifications are also stored temporarily for easy review of
 * recent notifications.
 */
export interface EditorNotification {
  /**
   * Message to display to the user.
   */
  message: string;
  /**
   * Additional details that the user needs to know or possible
   * resolutions to an issue.
   */
  description?: string;
  /**
   * The level of priority to give the message. Lower priority
   * messages will be quickly displayed then disappear (like a toast).
   * Higher priority messages will display a modal to ensure it is
   * viewed.
   */
  level?: NotificationLevel;
  /**
   * Actions that can be taken based on the notification.
   */
  actions?: Array<NotificationAction>;
}

/**
 * Modals are centralized in the display to be outside of other
 * modals and structures. Modal windows live as siblings in the
 * DOM.
 *
 * This helps to prevent issues where one modal is clipping
 * another without having to pass the modal through the template
 * stack to be outside of another modal.
 *
 * This also allows reuse of modals across parts of the editor.
 */
export class NotificationsPart extends BasePart implements Part {
  notifications: Array<EditorNotification>;

  constructor() {
    super();
    this.notifications = [];

    document.addEventListener(EVENT_NOTIFICATION, (evt: Event) => {
      this.addInfo((evt as CustomEvent).detail);
    });
  }

  addDebug(notification: EditorNotification) {
    if (!notification.level) {
      notification.level = NotificationLevel.Debug;
    }
    this.notifications.push(notification);
  }

  addError(notification: EditorNotification) {
    if (!notification.level) {
      notification.level = NotificationLevel.Error;
    }
    this.notifications.push(notification);
  }

  addInfo(notification: EditorNotification) {
    if (!notification.level) {
      notification.level = NotificationLevel.Info;
    }
    this.notifications.push(notification);
  }

  addWarning(notification: EditorNotification) {
    if (!notification.level) {
      notification.level = NotificationLevel.Warning;
    }
    this.notifications.push(notification);
  }

  template(editor: LiveEditor): TemplateResult {
    return html`<div class="le__part__notifications">
      <span class="material-icons">notifications</span>
    </div>`;
  }
}

export function announceNotification(notification: EditorNotification) {
  document.dispatchEvent(
    new CustomEvent(EVENT_NOTIFICATION, {detail: notification})
  );
}
