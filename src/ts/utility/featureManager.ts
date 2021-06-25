import {DataType} from '@blinkk/selective-edit/dist/utility/dataType';

export interface FeatureManagerConfig {
  defaultStatus: boolean;
}

export type FeatureManagerSettings = Record<string, any>;

export class FeatureManager {
  config: FeatureManagerConfig;
  features: Record<string, boolean | FeatureManagerSettings>;
  protected internalSettings: Record<string, FeatureManagerSettings>;

  constructor(config: FeatureManagerConfig) {
    this.config = config;
    this.features = {};
    this.internalSettings = {};
  }

  /**
   * Determine if a feature is turned off.
   *
   * @param featureKey Key to represent the feature.
   * @returns True if the feature is off or the default is off.
   */
  isOff(featureKey: string): boolean {
    return !this.isOn(featureKey);
  }

  /**
   * Determine if a feature is turned on.
   *
   * @param featureKey Key to represent the feature.
   * @returns True if the feature is on or the default is on.
   */
  isOn(featureKey: string): boolean {
    if (featureKey in this.features) {
      return Boolean(this.features[featureKey]);
    }

    return this.config.defaultStatus;
  }

  /**
   * Turn a feature off.
   *
   * @param featureKey Key to represent the feature.
   * @returns false
   */
  off(
    featureKey: string,
    settings?: FeatureManagerSettings
  ): FeatureManagerSettings | boolean {
    this.features[featureKey] = false;
    if (settings) {
      this.internalSettings[featureKey] = settings;
      return settings;
    }
    return this.features[featureKey];
  }

  /**
   * Turn a feature on.
   *
   * @param featureKey Key to represent the feature.
   * @returns true
   */
  on(
    featureKey: string,
    settings?: FeatureManagerSettings
  ): FeatureManagerSettings | boolean {
    this.features[featureKey] = true;
    if (settings) {
      this.internalSettings[featureKey] = settings;
      return settings;
    }
    return this.features[featureKey];
  }

  set(
    featureKey: string,
    value: boolean | FeatureManagerSettings
  ): FeatureManagerSettings | boolean {
    this.features[featureKey] = Boolean(value);
    if (DataType.isObject(value)) {
      this.internalSettings[featureKey] = value as FeatureManagerSettings;
      return this.internalSettings[featureKey];
    }
    return this.features[featureKey];
  }

  settings(featureKey: string): FeatureManagerSettings | undefined {
    if (featureKey in this.internalSettings) {
      return this.internalSettings[featureKey];
    }
    // Default to no settings.
    return undefined;
  }
}
