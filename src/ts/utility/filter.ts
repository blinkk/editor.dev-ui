import {DataType} from '@blinkk/selective-edit/dist/utility/dataType';
import minimatch from 'minimatch';

export interface FilterComponent {
  filter(values: Array<string>): Array<string>;
  matches(value: string): boolean;
}

export interface IncludeExcludeFilterConfig {
  /**
   * If provided, the value needs to match at least one pattern
   * to be considered as passing the filter.
   */
  includes?: Array<string | RegExp>;
  /**
   * If provided, the value cannot match any of the patterns
   * to be considered as passing the filter.
   */
  excludes?: Array<string | RegExp>;
}

/**
 * Filter that allows for defining a set of regular expressions
 * for including a value or excluding a value based on the expressions.
 *
 * Depending on which config values are provided, the filtering
 * works differently.
 *
 * If both the `includes` and `excludes` are defined in the config
 * then the value being matched must match at least one of the
 * patterns in the `includes` and cannot match any of the `exclude`
 * patterns.
 *
 * If only `includes` are provided, the value must match at least
 * one of the patterns.
 *
 * If only the `excludes` are provides, the value cannot match any
 * of the patterns.
 */
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

export interface GlobFilterConfig {
  /**
   * When true, the results of the match are flipped.
   *
   * For instance, when you want to filter out ignored files
   * you can use the `negate` option to filter out any matches.
   */
  negate?: boolean;
  /**
   * Value needs to match at least one of the patterns to
   * pass the filtering.
   */
  patterns: Array<string>;
}

/**
 * Filtering use glob style patterns.
 */
export class GlobFilter implements FilterComponent {
  config: GlobFilterConfig;

  constructor(config: GlobFilterConfig) {
    this.config = config;
  }

  filter(values: Array<string>): Array<string> {
    return values.filter(this.matches, this);
  }

  matches(value: string): boolean {
    // If there are includes, it needs to match at least one of them.
    let matchesPattern = false;
    for (const pattern of this.config.patterns) {
      if (minimatch(value, pattern)) {
        matchesPattern = true;
        break;
      }
    }

    if (this.config.negate) {
      return !matchesPattern;
    }

    return matchesPattern;
  }
}

export interface GitignoreFilterConfig {
  /**
   * Value needs to match at least one of the patterns to
   * pass the filtering.
   */
  patterns: Array<string>;
}

/**
 * Filtering use gitignore glob style patterns.
 */
export class GitignoreFilter implements FilterComponent {
  config: GitignoreFilterConfig;

  constructor(config: GitignoreFilterConfig) {
    this.config = config;

    // Convert the patterns to gitignore style globs.
    this.config.patterns = this.convertPatterns(this.config.patterns);
  }

  /**
   *
   * @param values Raw patterns for ignored filters
   * @returns
   */
  protected convertPatterns(values: Array<string>): Array<string> {
    const patterns: Array<string> = [];
    for (const pattern of values) {
      const prefix = pattern.charAt(0) !== '/' ? '**/' : '';
      if (!isFileGlobPattern(pattern)) {
        const suffix = pattern.slice(-1) === '*' ? '*' : '/**';
        if (pattern.slice(-1) === '/') {
          patterns.push(`${prefix}${pattern}${suffix}`);
        } else {
          // Create pair of globs.
          patterns.push(`${prefix}${pattern}`);
          patterns.push(`${prefix}${pattern}${suffix}`);
        }
      } else {
        patterns.push(pattern);
        if (pattern.startsWith('*') && !pattern.startsWith('**')) {
          patterns.push(`${prefix}${pattern}`);
        }
      }
    }
    return patterns;
  }

  filter(values: Array<string>): Array<string> {
    return values.filter(this.matches, this);
  }

  matches(value: string): boolean {
    // If there are includes, it needs to match at least one of them.
    let matchesPattern = false;
    for (const pattern of this.config.patterns) {
      if (minimatch(value, pattern)) {
        matchesPattern = true;
        break;
      }
    }

    // Using ignores, which means we want to remove matches.
    return !matchesPattern;
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

function isFileGlobPattern(pattern: string) {
  return pattern === '*' || pattern.indexOf('.') !== -1;
}
