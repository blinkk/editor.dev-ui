/**
 * Utility for working with different storages.
 *
 * Built-in 'in-memory' storage fallback.
 */
export class DataStorage {
  protected storage?: Storage;

  clear() {
    return this.storageObj.clear();
  }

  get length(): number {
    return this.storageObj.length;
  }

  get storageObj(): Storage {
    if (!this.storage) {
      this.storage = new InMemoryStorage();
    }
    return this.storage as Storage;
  }

  getItem(key: string): string | null {
    return this.storageObj.getItem(key);
  }

  getItemArray(key: string): Array<any> {
    const value = this.getItem(key);
    if (!value) {
      return [];
    }
    return JSON.parse(value) as Array<any>;
  }

  getItemBoolean(key: string, defaultValue = false): boolean {
    const value = this.getItem(key);
    if (value === null) {
      return defaultValue;
    }
    return value === 'true';
  }

  getItemRecord(key: string): Record<string, any> {
    const value = this.getItem(key);
    if (!value) {
      return {};
    }
    return JSON.parse(value) as Record<string, any>;
  }

  key(index: number): string | null {
    return this.storageObj.key(index);
  }

  removeItem(key: string) {
    return this.storageObj.removeItem(key);
  }

  setItem(key: string, value: string) {
    return this.storageObj.setItem(key, value);
  }

  setItemArray(key: string, value: Array<any>) {
    return this.storageObj.setItem(key, JSON.stringify(value));
  }

  setItemBoolean(key: string, value: boolean) {
    return this.storageObj.setItem(key, value ? 'true' : 'false');
  }

  setItemRecord(key: string, value: Record<string, any>) {
    return this.storageObj.setItem(key, JSON.stringify(value));
  }
}

/* istanbul ignore next */
export class LocalDataStorage extends DataStorage {
  get storageObj(): Storage {
    return localStorage;
  }
}

/* istanbul ignore next */
export class SessionDataStorage extends DataStorage {
  get storageObj(): Storage {
    return sessionStorage;
  }
}

class InMemoryStorage implements Storage {
  protected obj: Record<string, string>;

  constructor() {
    this.obj = {};
  }

  clear() {
    this.obj = {};
  }

  getItem(index: string): string | null {
    if (this.obj[index] !== undefined) {
      return this.obj[index];
    }
    return null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.obj).sort();
    if (index < keys.length) {
      return this.obj[keys[index]];
    }
    return null;
  }

  get length() {
    return Object.keys(this.obj).length;
  }

  removeItem(index: string) {
    if (this.obj[index] !== undefined) {
      delete this.obj[index];
    }
  }

  setItem(index: string, value: string) {
    this.obj[index] = value;
  }
}
