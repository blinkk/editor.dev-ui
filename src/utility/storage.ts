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
}
