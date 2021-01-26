import {Constructor} from '@blinkk/selective-edit/dist/src/mixins';

export function ListenersMixin<TBase extends Constructor>(Base: TBase) {
  return class ListenersClass extends Base {
    _listeners?: Record<string, Array<() => void>>;

    /**
     * Add a new event listener for watching for events to happen.
     *
     * @param eventName Event name for the listener.
     * @param callback Callback to know when the listener triggers.
     */
    addListener(eventName: string, callback: () => void) {
      if (!this.listeners[eventName]) {
        this.listeners[eventName] = [];
      }
      this.listeners[eventName].push(callback);
    }

    get listeners(): Record<string, Array<() => void>> {
      if (!this._listeners) {
        this._listeners = {};
      }
      return this._listeners;
    }

    /**
     * Trigger the listener callbacks for a given event.
     *
     * @param eventName Event name to trigger.
     */
    triggerListener(eventName: string) {
      if (this.listeners[eventName]) {
        for (const listener of this.listeners[eventName]) {
          listener();
        }
      }
    }
  };
}
