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
   * Has the notification been read by the user.
   *
   * **Note:** This will automatically be set to false when a notification
   * is added to the editor notifications.
   */
  isRead?: boolean;
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
  protected notifications: Array<EditorNotification>;

  constructor() {
    super();
    this.notifications = [];

    document.addEventListener(EVENT_NOTIFICATION, (evt: Event) => {
      this.addInfo((evt as CustomEvent).detail);
    });
  }

  addDebug(notification: EditorNotification) {
    this.notifications.push(
      this.scrubNewNotification(notification, NotificationLevel.Debug)
    );
  }

  addError(notification: EditorNotification) {
    this.notifications.push(
      this.scrubNewNotification(notification, NotificationLevel.Error)
    );
  }

  addInfo(notification: EditorNotification) {
    this.notifications.push(
      this.scrubNewNotification(notification, NotificationLevel.Info)
    );
  }

  addWarning(notification: EditorNotification) {
    this.notifications.push(
      this.scrubNewNotification(notification, NotificationLevel.Warning)
    );
  }

  get hasUnreadNotifications() {
    for (const notification of this.notifications) {
      if (!notification.isRead) {
        return true;
      }
    }
    return false;
  }

  protected scrubNewNotification(
    notification: EditorNotification,
    defaultLevel: NotificationLevel
  ): EditorNotification {
    if (!notification.level) {
      notification.level = defaultLevel;
    }
    notification.isRead = false;
    return notification;
  }

  template(editor: LiveEditor): TemplateResult {
    let icon = 'notifications';

    if (this.hasUnreadNotifications) {
      icon = 'notifications_active';
    }

    return html`<div class="le__part__notifications">
      <span class="material-icons">${icon}</span>
    </div>`;
  }
}

export function announceNotification(notification: EditorNotification) {
  document.dispatchEvent(
    new CustomEvent(EVENT_NOTIFICATION, {detail: notification})
  );
}
