export class Storage {
  isTesting: boolean;

  constructor(isTesting: boolean) {
    this.isTesting = isTesting;
  }

  clear() {
    if (this.isTesting) {
      return;
    }
    return localStorage.clear();
  }

  getItem(key: string): string | null {
    if (this.isTesting) {
      return null;
    }
    return localStorage.getItem(key);
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
    return localStorage.removeItem(key);
  }

  setItem(key: string, value: string) {
    if (this.isTesting) {
      return;
    }
    return localStorage.setItem(key, value);
  }

  setItemArray(key: string, value: Array<any>) {
    if (this.isTesting) {
      return;
    }
    return localStorage.setItem(key, JSON.stringify(value));
  }

  setItemRecord(key: string, value: Record<string, any>) {
    if (this.isTesting) {
      return;
    }
    return localStorage.setItem(key, JSON.stringify(value));
  }
}
