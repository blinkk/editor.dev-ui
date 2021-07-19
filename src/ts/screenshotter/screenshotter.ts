/**
 * Script for generating screenshots used for the documentation.
 *
 * Automated to help keep documentation screenshot updated in an
 * easy and reproducable manner.
 *
 * To generate the screenshots run `yarn run screenshot:docs`
 */
import * as fs from 'fs';

import {ACTIONS, ActionComponent, ActionConfig} from './actions';

import puppeteer from 'puppeteer';
import yaml from 'js-yaml';

export class Screenshotter implements ScreenshotterComponent {
  config: ScreenshotterConfig;
  screenshotsConfig: ScreenshotFileConfig;

  constructor(config: ScreenshotterConfig) {
    this.config = config;

    // Ensure the baseUrl ends with a slash.
    if (!this.config.baseUrl.endsWith('/')) {
      this.config.baseUrl += '/';
    }

    // Ensure the outputDir ends with a slash.
    if (!this.config.outputDir.endsWith('/')) {
      this.config.outputDir += '/';
    }

    this.screenshotsConfig = yaml.load(
      fs.readFileSync(this.config.configFile, {
        encoding: 'utf8',
        flag: 'r',
      })
    ) as ScreenshotFileConfig;
  }

  determineAction(actionConfig: ActionConfig): ActionComponent {
    for (const ActionComponent of ACTIONS) {
      if (actionConfig.action === ActionComponent.action) {
        return new ActionComponent(actionConfig as any);
      }
    }

    throw new Error('Unable to determine action from config');
  }

  async generate() {
    const browser = await puppeteer.launch({
      defaultViewport: {
        height: this.screenshotsConfig.browser?.viewport?.height || 880,
        width: this.screenshotsConfig.browser?.viewport?.width || 1280,
      },
    });

    try {
      // TODO: parallelize the loading.
      // const pendingPages: Array<Promise<any>> = [];

      for (const [outPath, screenshotConfig] of Object.entries(
        this.screenshotsConfig.screenshots
      )) {
        const screenshotPath = this.pathForScreenshot(outPath);
        let hasScreenshotted = false;
        const page = await browser.newPage();
        page.on('console', msg => console.log('LOG: ', msg.text()));
        await page.goto(this.urlForScreenshot(screenshotConfig.path));

        // Perform the actions from the config.
        for (const actionConfig of screenshotConfig.actions) {
          const action = this.determineAction(actionConfig);
          const result = await action.perform(page, {
            screenshotPath: screenshotPath,
          });
          if (result.completedScreenshot) {
            hasScreenshotted = true;
          }
        }

        // Automatically screenshot if not done manually after all actions.
        if (!hasScreenshotted) {
          await page.screenshot({
            path: screenshotPath,
          });
        }

        await page.close();
      }
    } finally {
      await browser.close();
    }

    // TODO: Use finally to stop the example server.
  }

  pathForScreenshot(path?: string) {
    path = path?.replace(/\/*/g, '') || '';
    return `${this.config.outputDir}${path}.png`;
  }

  urlForScreenshot(path?: string) {
    path = path?.replace(/\/*/g, '') || '';
    const url = new URL(`${this.config.baseUrl}${path}`);

    // If your expected result is "http://foo.bar/?x=1&y=2&x=42"
    if (this.screenshotsConfig.browser?.params) {
      for (const [param, value] of Object.entries(
        this.screenshotsConfig.browser?.params
      )) {
        url.searchParams.append(param, value);
      }
    }

    return url.toString();
  }
}

export interface ScreenshotterConfig {
  /**
   * Base url for all pages.
   */
  baseUrl: string;
  /**
   * Configuration file for the screenshots.
   */
  configFile: string;
  /**
   * Output directory for where the screenshots will be saved.
   */
  outputDir: string;
}

export interface ScreenshotterComponent {
  config: ScreenshotterConfig;
  screenshotsConfig: ScreenshotFileConfig;
}

/**
 * Format for the screenshot configuration file.
 */
export interface ScreenshotFileConfig {
  /**
   * Browser configuration for how the screenshots are taken.
   */
  browser?: BrowserConfig;
  /**
   * Screenshots to be taken by the tool.
   */
  screenshots: Record<string, ScreenshotConfig>;
}

export interface BrowserConfig {
  viewport?: ViewportConfig;
  /**
   * Params to add to every URL.
   */
  params?: Record<string, string>;
}

export interface ViewportConfig {
  height?: number;
  width?: number;
}

export interface ScreenshotConfig {
  actions: Array<ActionConfig>;
  /**
   * Path (from server root) to load for the screenshot.
   */
  path?: string;
}
