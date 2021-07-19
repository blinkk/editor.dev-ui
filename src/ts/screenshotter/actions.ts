import puppeteer from 'puppeteer';

export abstract class ActionStaticComponent {
  static action = 'action';
}

export class HighlightAction
  extends ActionStaticComponent
  implements ActionComponent
{
  static action = 'highlight';

  config: HighlightActionConfig;

  constructor(config: HighlightActionConfig) {
    super();
    this.config = config;
  }

  async perform(
    page: puppeteer.Page,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: ActionPerformOptions
  ): Promise<ActionResult> {
    if (this.config.all) {
      await page.evaluate(selector => {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          element.classList.add('highlighted');
        }
      }, this.config.selector);
    } else {
      await page.evaluate(selector => {
        const element = document.querySelector(selector);
        element?.classList.add('highlighted');
      }, this.config.selector);
    }

    return {};
  }
}

export class ScreenshotAction
  extends ActionStaticComponent
  implements ActionComponent
{
  static action = 'screenshot';

  config: ScreenshotActionConfig;

  constructor(config: ScreenshotActionConfig) {
    super();
    this.config = config;
  }

  async perform(
    page: puppeteer.Page,
    options: ActionPerformOptions
  ): Promise<ActionResult> {
    let screenshotElement: any = page;
    if (this.config.selector) {
      screenshotElement = await page.$(this.config.selector);
    }

    await screenshotElement.screenshot({
      path: options.screenshotPath,
    });

    return {
      completedScreenshot: true,
    };
  }
}

export class WaitForFunctionAction
  extends ActionStaticComponent
  implements ActionComponent
{
  static action = 'waitForFunction';

  config: WaitForFunctionActionConfig;

  constructor(config: WaitForFunctionActionConfig) {
    super();
    this.config = config;
  }

  async perform(
    page: puppeteer.Page,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: ActionPerformOptions
  ): Promise<ActionResult> {
    await page.waitForFunction(this.config.pageFunction, this.config.options);
    return {};
  }
}

export class WaitForSelectorAction
  extends ActionStaticComponent
  implements ActionComponent
{
  static action = 'waitForSelector';

  config: WaitForSelectorActionConfig;

  constructor(config: WaitForSelectorActionConfig) {
    super();
    this.config = config;
  }

  async perform(
    page: puppeteer.Page,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: ActionPerformOptions
  ): Promise<ActionResult> {
    await page.waitForSelector(this.config.selector, this.config.options);
    return {};
  }
}

/**
 * Actions available for the screenshotter to use.
 */
export const ACTIONS = [
  HighlightAction,
  ScreenshotAction,
  WaitForFunctionAction,
  WaitForSelectorAction,
];

export interface ActionComponent {
  config: ActionConfig;
  perform(
    page: puppeteer.Page,
    options: ActionPerformOptions
  ): Promise<ActionResult>;
}

export interface ActionConfig {
  action: string;
}

export interface ActionPerformOptions {
  screenshotPath: string;
}

export interface ActionResult {
  completedScreenshot?: boolean;
  result?: any;
}

export interface HighlightActionConfig extends ActionConfig {
  /**
   * Selector for highlighting part of the page.
   */
  selector: string;
  all?: boolean;
}

export interface ScreenshotActionConfig extends ActionConfig {
  /**
   * Selector for screenshotting only part of the page.
   */
  selector?: string;
}

export interface WaitForFunctionActionConfig extends ActionConfig {
  /**
   * Function to run in the page to wait for truthy result.
   */
  pageFunction: string;
  options?: {
    timeout?: number;
    polling?: string | number;
  };
}

export interface WaitForSelectorActionConfig extends ActionConfig {
  /**
   * Selector for waiting for page changes.
   */
  selector: string;
  options?: {
    visible?: boolean;
    hidden?: boolean;
    timeout?: number;
  };
}
