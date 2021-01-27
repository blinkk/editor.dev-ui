import {BasePart, Part} from '.';
import {DialogActionLevel, DialogModal, DialogPriorityLevel} from '../ui/modal';
import {
  TemplateResult,
  expandClasses,
  html,
  repeat,
} from '@blinkk/selective-edit';
import {EVENT_NOTIFICATION} from '../events';
import {LiveEditor} from '../editor';

const MODAL_KEY_NOTIFICATIONS = 'notifications';

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
   * Actions that can be taken based on the notification.
   */
  actions?: Array<NotificationAction>;
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
   * Message to display to the user.
   */
  message: string;
}

/**
 * Used to track notification state in the notification part.
 */
interface InternalNotification extends EditorNotification {
  /**
   * Date the notification was added.
   */
  addedOn?: Date;
  /**
   * Is the notification expanded?
   */
  isExpanded?: boolean;
  /**
   * Has the notification been read by the user?
   */
  isRead?: boolean;
  /**
   * Some sub-notification types have addition properties.
   */
  [x: string]: any;
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
  protected notifications: Array<InternalNotification>;
  protected hasNewError: boolean;

  constructor() {
    super();
    this.notifications = [];
    this.hasNewError = false;

    document.addEventListener(EVENT_NOTIFICATION, (evt: Event) => {
      this.addInfo((evt as CustomEvent).detail);
      this.render();
    });
  }

  addDebug(notification: EditorNotification) {
    this.addNotification(notification, NotificationLevel.Debug);
  }

  addError(notification: EditorNotification, isDisplayed = false) {
    this.addNotification(notification, NotificationLevel.Error, isDisplayed);
  }

  addInfo(notification: EditorNotification) {
    this.addNotification(notification, NotificationLevel.Info);
  }

  addNotification(
    notification: EditorNotification,
    defaultLevel = NotificationLevel.Info,
    isDisplayed = false
  ) {
    this.notifications.push(
      this.scrubNewNotification(notification, defaultLevel)
    );

    if (notification.level === NotificationLevel.Error && !isDisplayed) {
      this.hasNewError = true;
    }
  }

  addWarning(notification: EditorNotification) {
    this.addNotification(notification, NotificationLevel.Warning);
  }

  classesForNotification(notification: InternalNotification): Array<string> {
    const classes = ['ls__part__notifications__notification'];

    if (notification.level === NotificationLevel.Error) {
      classes.push('ls__part__notifications__notification--error');
    }

    if (notification.level === NotificationLevel.Warning) {
      classes.push('ls__part__notifications__notification--warning');
    }

    return classes;
  }

  classesForPart(): Array<string> {
    const classes = [
      'le__part__notifications',
      'le__clickable',
      'le__tooltip--bottom-left',
    ];

    if (this.hasUnreadNotificationsAtLevel(NotificationLevel.Error)) {
      classes.push('le__part__notifications--errors');
    }

    return classes;
  }

  protected getOrCreateModalNotifications(editor: LiveEditor): DialogModal {
    if (!editor.parts.modals.modals[MODAL_KEY_NOTIFICATIONS]) {
      const modal = new DialogModal({
        title: 'Notifications',
        priority: DialogPriorityLevel.High,
      });
      modal.templateModal = this.templateNotifications.bind(this);
      modal.actions.push({
        label: 'Mark all read',
        level: DialogActionLevel.Primary,
        isDisabledFunc: () => false,
        onClick: () => {
          this.markAllAsRead();
          modal.hide();
        },
      });
      modal.addCancelAction('Close');
      editor.parts.modals.modals[MODAL_KEY_NOTIFICATIONS] = modal;
    }
    return editor.parts.modals.modals[MODAL_KEY_NOTIFICATIONS] as DialogModal;
  }

  getIconForNotificationLevel(level: NotificationLevel, isRead: boolean) {
    if (level === NotificationLevel.Error) {
      return 'notification_important';
    }
    if (!isRead) {
      return 'notifications_active';
    }
    return 'notifications';
  }

  get hasUnreadNotifications() {
    for (const notification of this.notifications) {
      if (!notification.isRead) {
        return true;
      }
    }
    return false;
  }

  hasUnreadNotificationsAtLevel(level: NotificationLevel) {
    for (const notification of this.notifications) {
      if (!notification.level) {
        continue;
      }

      if (!notification.isRead && notification.level >= level) {
        return true;
      }
    }
    return false;
  }

  markAllAsRead() {
    for (const notification of this.notifications) {
      notification.isRead = true;
    }
  }

  protected scrubNewNotification(
    notification: EditorNotification,
    defaultLevel: NotificationLevel
  ): InternalNotification {
    const internalNotification: InternalNotification = notification;
    if (!internalNotification.level) {
      internalNotification.level = defaultLevel;
    }
    internalNotification.addedOn = new Date();
    internalNotification.isRead = false;
    return internalNotification;
  }

  template(editor: LiveEditor): TemplateResult {
    let icon = 'notifications';

    if (this.hasUnreadNotificationsAtLevel(NotificationLevel.Error)) {
      icon = 'notification_important';

      // Show the modal when there are unread error notifications.
      // Just shows the first time it has a new error, can close
      // without needing to mark the notification as read.
      if (this.hasNewError) {
        const modal = this.getOrCreateModalNotifications(editor);
        modal.isVisible = true;
        this.hasNewError = false;
      }
    } else if (this.hasUnreadNotifications) {
      icon = 'notifications_active';
    }

    const handleOpenNotifications = () => {
      const modal = this.getOrCreateModalNotifications(editor);
      modal.show();
    };

    return html`<div
      class=${expandClasses(this.classesForPart())}
      data-tip="Notifications"
      @click=${handleOpenNotifications}
    >
      <span class="material-icons">${icon}</span>
    </div>`;
  }

  templateNotification(
    editor: LiveEditor,
    notification: InternalNotification
  ): TemplateResult {
    let markReadButton = html``;
    if (!notification.isRead) {
      markReadButton = html`<div
        class="ls__part__notifications__notification__mark le__clickable"
        @click=${(evt: Event) => {
          evt.stopPropagation();
          notification.isRead = true;
          this.render();
        }}
      >
        Mark read
      </div>`;
    }

    const hasExtra = notification.description || notification.meta;
    const handleClick = (evt: Event) => {
      if (!hasExtra) {
        return;
      }
      evt.stopPropagation();
      notification.isExpanded = !notification.isExpanded;
      this.render();
    };

    let description = html``;
    if (notification.isExpanded && notification.description) {
      description = html`<div
        class="ls__part__notifications__notification__description"
      >
        ${notification.description}
      </div>`;
    }

    let meta = html``;
    if (notification.isExpanded && notification.meta) {
      meta = html`<div class="ls__part__notifications__notification__meta">
        <pre><code>${JSON.stringify(notification.meta, null, 2)}</code></pre>
      </div>`;
    }

    return html`<div
      class=${expandClasses(this.classesForNotification(notification))}
    >
      <div class="ls__part__notifications__notification__status">
        <span class="material-icons"
          >${this.getIconForNotificationLevel(
            notification.level || NotificationLevel.Info,
            notification.isRead || false
          )}</span
        >
      </div>
      <div
        class="ls__part__notifications__notification__label ${hasExtra
          ? 'le__clickable'
          : ''}"
        @click=${handleClick}
      >
        ${hasExtra
          ? html`<span class="material-icons"
              >${notification.isExpanded
                ? 'keyboard_arrow_down'
                : 'keyboard_arrow_right'}</span
            >`
          : ''}
        ${notification.message}
      </div>
      ${markReadButton} ${description} ${meta}
      <div class="ls__part__notifications__notification__actions">
        ${this.templateNotificationActions(editor, notification)}
      </div>
    </div>`;
  }

  templateNotificationActions(
    editor: LiveEditor,
    notification: InternalNotification
  ): TemplateResult {
    let additionalDetails = html``;
    if (notification.actions) {
      additionalDetails = html` ${repeat(
        notification.actions,
        action => action.label,
        action => {
          const handleClick = (evt: Event) => {
            evt.preventDefault();
            evt.stopPropagation();
            document.dispatchEvent(
              new CustomEvent(action.customEvent, {
                detail: action.details,
              })
            );

            const modal = this.getOrCreateModalNotifications(editor);
            modal.hide();
          };
          return html`<button
            class="le__button le__clickable"
            @click=${handleClick}
          >
            ${action.label}
          </button>`;
        }
      )}`;
    }

    return additionalDetails;
  }

  templateNotifications(editor: LiveEditor): TemplateResult {
    if (!this.notifications.length) {
      return html`<div class="le__part__notifications__modal">
        <div class="le__list">
          <div class="le__list__item le__list__item--pad">
            <div class="le__list__item__icon">
              <span class="material-icons">check</span>
            </div>
            <div class="le__list__item__label">
              No notifications yet. Please check back later.
            </div>
          </div>
        </div>
      </div>`;
    }

    // Sort notifications by the timestamp in latest first.
    this.notifications.sort(
      (a, b) => (b.addedOn?.getTime() || 0) - (a.addedOn?.getTime() || 0)
    );

    return html`<div class="le__part__notifications__modal">
      <div class="ls__part__notifications__notifications">
        ${repeat(
          this.notifications,
          notification => notification.addedOn?.getUTCDate(),
          (notification: InternalNotification) =>
            this.templateNotification(editor, notification)
        )}
      </div>
    </div>`;
  }
}

export function announceNotification(notification: EditorNotification) {
  document.dispatchEvent(
    new CustomEvent(EVENT_NOTIFICATION, {detail: notification})
  );
}
