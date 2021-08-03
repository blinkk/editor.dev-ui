import {BasePart, UiPartComponent, UiPartConfig} from '.';
import {DialogActionLevel, DialogModal, DialogPriorityLevel} from '../modal';
import {
  EVENT_NOTIFICATION_ADD,
  EVENT_NOTIFICATION_READ,
  EVENT_NOTIFICATION_SHOW,
} from '../../events';
import {TemplateResult, classMap, html, repeat} from '@blinkk/selective-edit';
import {showToast} from './toasts';

const MODAL_KEY_NOTIFICATION = 'notification';
const MODAL_KEY_NOTIFICATIONS = 'notifications';

export type NotificationsPartConfig = UiPartConfig;

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
  /**
   * Action label.
   */
  label: string;
  /**
   * Custom event to dispatch.
   */
  customEvent: string;
  /**
   * Details to send along with the custom event.
   */
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
  /**
   * Title to use in the modal title when viewing individual
   * notifications.
   */
  title?: string;
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
export class NotificationsPart extends BasePart implements UiPartComponent {
  config: NotificationsPartConfig;
  protected notifications: Set<InternalNotification>;
  protected hasNewError: boolean;
  protected currentNotification?: InternalNotification;

  constructor(config: NotificationsPartConfig) {
    super();
    this.config = config;
    this.notifications = new Set();
    this.hasNewError = false;

    document.addEventListener(EVENT_NOTIFICATION_ADD, (evt: Event) => {
      this.addInfo((evt as CustomEvent).detail);
      this.render();
    });

    document.addEventListener(EVENT_NOTIFICATION_READ, (evt: Event) => {
      const notification = (evt as CustomEvent).detail as EditorNotification;
      this.readNotification(notification);
    });

    document.addEventListener(EVENT_NOTIFICATION_SHOW, (evt: Event) => {
      const notification = (evt as CustomEvent).detail as EditorNotification;
      this.showNotification(notification);
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
    this.notifications.add(
      this.scrubNewNotification(notification, defaultLevel)
    );

    if (notification.level === NotificationLevel.Error && !isDisplayed) {
      this.hasNewError = true;
    } else if (!(notification as InternalNotification).isRead) {
      // Only show the toast when the notification has not been read.
      showToast({
        editor: this.config.editor,
        notification: notification,
      });
    }
  }

  addWarning(notification: EditorNotification) {
    this.addNotification(notification, NotificationLevel.Warning);
  }

  classesForNotification(
    notification: InternalNotification
  ): Record<string, boolean> {
    return {
      ls__part__notifications__notification: true,
      'ls__part__notifications__notification--error':
        notification.level === NotificationLevel.Error,
      'ls__part__notifications__notification--warning':
        notification.level === NotificationLevel.Warning,
    };
  }

  classesForPart(): Record<string, boolean> {
    return {
      le__part__notifications: true,
      le__clickable: true,
      'le__part__notifications--errors': this.hasUnreadNotificationsAtLevel(
        NotificationLevel.Error
      ),
      'le__tooltip--bottom-left': true,
    };
  }

  protected getOrCreateModalNotificationSingle(): DialogModal {
    if (!this.config.editor.ui.partModals.modals[MODAL_KEY_NOTIFICATION]) {
      const modal = new DialogModal({
        title: 'Notification',
        priority: DialogPriorityLevel.High,
      });
      modal.templateModal = this.templateNotificationSingle.bind(this);

      // When the modal is hidden, remove the current notification so it does
      // not open again instantly.
      modal.addListener('hide', () => {
        this.currentNotification = undefined;
        this.render();
      });

      this.config.editor.ui.partModals.modals[MODAL_KEY_NOTIFICATION] = modal;
    }
    return this.config.editor.ui.partModals.modals[
      MODAL_KEY_NOTIFICATION
    ] as DialogModal;
  }

  protected getOrCreateModalNotifications(): DialogModal {
    if (!this.config.editor.ui.partModals.modals[MODAL_KEY_NOTIFICATIONS]) {
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
      this.config.editor.ui.partModals.modals[MODAL_KEY_NOTIFICATIONS] = modal;
    }
    return this.config.editor.ui.partModals.modals[
      MODAL_KEY_NOTIFICATIONS
    ] as DialogModal;
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

  readNotification(
    notification: EditorNotification,
    defaultLevel = NotificationLevel.Info
  ) {
    // Only scrub the notification if it has not been added before.
    if (!this.notifications.has(notification)) {
      notification = this.scrubNewNotification(notification, defaultLevel);
      (notification as InternalNotification).isRead = true;
      this.notifications.add(notification);
    }
    (notification as InternalNotification).isRead = true;
    this.render();
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

  showNotification(
    notification: EditorNotification,
    defaultLevel = NotificationLevel.Info
  ) {
    const newNotification = this.scrubNewNotification(
      notification,
      defaultLevel
    );
    this.notifications.add(notification);
    this.currentNotification = newNotification;
  }

  template(): TemplateResult {
    let icon = 'notifications';

    if (this.hasUnreadNotificationsAtLevel(NotificationLevel.Error)) {
      icon = 'notification_important';

      // Show the modal when there are unread error notifications.
      // Just shows the first time it has a new error, can close
      // without needing to mark the notification as read.
      if (this.hasNewError) {
        const modal = this.getOrCreateModalNotifications();
        modal.isVisible = true;
        this.hasNewError = false;
      }
    } else if (this.hasUnreadNotifications) {
      icon = 'notifications_active';
    }

    if (this.currentNotification) {
      this.currentNotification.isRead = true;
      const modal = this.getOrCreateModalNotificationSingle();
      modal.config.title = this.currentNotification.title || modal.config.title;

      // Reset the actions to match the notification.
      modal.actions = [];

      for (const action of this.currentNotification.actions || []) {
        modal.actions.push({
          isDisabledFunc: () => false,
          label: action.label,
          level: DialogActionLevel.Primary,
          onClick: (evt: Event) => {
            evt.preventDefault();
            document.dispatchEvent(
              new CustomEvent(action.customEvent, {
                detail: action.details,
              })
            );
            modal.hide();
          },
        });
      }
      modal.addCancelAction('Close');

      modal.isVisible = true;
    }

    const handleOpenNotifications = () => {
      const modal = this.getOrCreateModalNotifications();
      modal.show();
    };

    return html`<div
      class=${classMap(this.classesForPart())}
      data-tip="Notifications"
      @click=${handleOpenNotifications}
    >
      <span class="material-icons">${icon}</span>
    </div>`;
  }

  templateNotification(notification: InternalNotification): TemplateResult {
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

    return html`<div
      class=${classMap(this.classesForNotification(notification))}
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
      ${markReadButton}
      ${notification.isExpanded
        ? this.templateNotificationDescription(notification)
        : ''}
      ${notification.isExpanded
        ? this.templateNotificationMeta(notification)
        : ''}
      <div class="ls__part__notifications__notification__actions">
        ${this.templateNotificationActions(notification)}
      </div>
    </div>`;
  }

  templateNotificationActions(
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

            const modal = this.getOrCreateModalNotifications();
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

  templateNotificationDescription(
    notification: InternalNotification
  ): TemplateResult {
    if (!notification.description) {
      return html``;
    }

    return html`<div class="ls__part__notifications__notification__description">
      ${notification.description}
    </div>`;
  }

  templateNotificationMeta(notification: InternalNotification): TemplateResult {
    if (!notification.meta) {
      return html``;
    }

    return html`<div class="ls__part__notifications__notification__meta">
      <pre><code>${JSON.stringify(notification.meta, null, 2)}</code></pre>
    </div>`;
  }

  templateNotificationSingle(): TemplateResult {
    if (!this.currentNotification) {
      return html``;
    }

    let expandMeta = html``;
    if (!this.currentNotification.isExpanded && this.currentNotification.meta) {
      expandMeta = html`<div
        class="ls__part__notifications__notification__expand"
        @click=${(evt: Event) => {
          if (!this.currentNotification) {
            return;
          }
          evt.stopPropagation();
          this.currentNotification.isExpanded = true;
          this.render();
        }}
      >
        Show more
      </div>`;
    }

    return html`<div class="le__part__notifications__modal">
      <div class="ls__part__notifications__notification__message">
        <div class="ls__part__notifications__notification__label">
          ${this.currentNotification?.message}
        </div>
        ${this.templateNotificationDescription(this.currentNotification)}
        ${this.currentNotification.isExpanded
          ? this.templateNotificationMeta(this.currentNotification)
          : expandMeta}
      </div>
    </div>`;
  }

  templateNotifications(): TemplateResult {
    if (!this.notifications.size) {
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
    const notifications = Array.from(this.notifications);
    notifications.sort(
      (a, b) => (b.addedOn?.getTime() || 0) - (a.addedOn?.getTime() || 0)
    );

    return html`<div class="le__part__notifications__modal">
      <div class="ls__part__notifications__notifications">
        ${repeat(
          notifications,
          notification => notification.addedOn?.getUTCDate(),
          (notification: InternalNotification) =>
            this.templateNotification(notification)
        )}
      </div>
    </div>`;
  }
}

export function announceNotification(notification: EditorNotification) {
  document.dispatchEvent(
    new CustomEvent(EVENT_NOTIFICATION_ADD, {detail: notification})
  );
}

export function readNotification(notification: EditorNotification) {
  document.dispatchEvent(
    new CustomEvent(EVENT_NOTIFICATION_READ, {detail: notification})
  );
}

export function showNotification(notification: EditorNotification) {
  document.dispatchEvent(
    new CustomEvent(EVENT_NOTIFICATION_SHOW, {detail: notification})
  );
}
