export class DataStorage {
  isTesting: boolean;

  constructor(isTesting = false) {
    this.isTesting = isTesting;
  }

  clear() {
    if (this.isTesting) {
      return;
    }
    return this.storageObj.clear();
  }

  get storageObj(): Storage {
    return localStorage;
  }

  getItem(key: string): string | null {
    if (this.isTesting) {
      return null;
    }
    return this.storageObj.getItem(key);
  }

  getItemArray(key: string): Array<any> {
    if (this.isTesting) {
      return [];
    }
    const value = this.getItem(key);
    if (!value) {
      return [];
    }
    return JSON.parse(value) as Array<any>;
  }

  getItemBoolean(key: string, defaultValue = false): boolean {
    if (this.isTesting) {
      return defaultValue;
    }
    const value = this.getItem(key);
    if (value === null) {
      return defaultValue;
    }
    return value === 'true';
  }

  getItemRecord(key: string): Record<string, any> {
    if (this.isTesting) {
      return {};
    }
    const value = this.getItem(key);
    if (!value) {
      return {};
    }
    return JSON.parse(value) as Record<string, any>;
  }

  removeItem(key: string) {
    if (this.isTesting) {
      return;
    }
    return this.storageObj.removeItem(key);
  }

  setItem(key: string, value: string) {
    if (this.isTesting) {
      return;
    }
    return this.storageObj.setItem(key, value);
  }

  setItemArray(key: string, value: Array<any>) {
    if (this.isTesting) {
      return;
    }
    return this.storageObj.setItem(key, JSON.stringify(value));
  }

  setItemBoolean(key: string, value: boolean) {
    if (this.isTesting) {
      return;
    }
    return this.storageObj.setItem(key, value ? 'true' : 'false');
  }

  setItemRecord(key: string, value: Record<string, any>) {
    if (this.isTesting) {
      return;
    }
    return this.storageObj.setItem(key, JSON.stringify(value));
  }
}

export class SessionDataStorage extends DataStorage {
  get storageObj(): Storage {
    return sessionStorage;
  }
}
