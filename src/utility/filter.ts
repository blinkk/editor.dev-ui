import {DataType} from '@blinkk/selective-edit/dist/src/utility/dataType';

export interface FilterComponent {
  filter(values: Array<string>): Array<string>;
  matches(value: string): boolean;
}

export interface IncludeExcludeFilterConfig {
  includes?: Array<string | RegExp>;
  excludes?: Array<string | RegExp>;
}

export class IncludeExcludeFilter implements FilterComponent {
  config: IncludeExcludeFilterConfig;

  constructor(config: IncludeExcludeFilterConfig) {
    this.config = config;

    // Force all of the includes and excludes to be regex.
    this.convertRegex(this.config.includes);
    this.convertRegex(this.config.excludes);
  }

  protected convertRegex(values?: Array<RegExp | string>) {
    if (!values) {
      return;
    }

    for (let i = 0; i < values.length; i++) {
      if (!DataType.isRegExp(values[i])) {
        values[i] = new RegExp(values[i]);
      }
    }
  }

  filter(values: Array<string>): Array<string> {
    return values.filter(this.matches, this);
  }

  matches(value: string): boolean {
    // If there are includes, it needs to match at least one of them.
    let matchesIncludes = false;
    if (this.config.includes) {
      for (const test of this.config.includes) {
        if ((test as RegExp).test(value)) {
          matchesIncludes = true;
          break;
        }
      }
    } else {
      matchesIncludes = true;
    }

    // If there are excludes, it cannot match any of them.
    let matchesExcludes = false;
    if (this.config.excludes) {
      for (const test of this.config.excludes) {
        if ((test as RegExp).test(value)) {
          matchesExcludes = true;
          break;
        }
      }
    }

    return matchesIncludes && !matchesExcludes;
  }
}

/**
 * Escapes a string to be used as a 'constant' in a regex.
 *
 * @param value string to be escaped
 * @returns escaped string to use in regex.
 */
export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
}
