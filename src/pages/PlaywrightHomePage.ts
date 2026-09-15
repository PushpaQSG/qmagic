import { type Locator, type Page } from '@playwright/test';

export class PlaywrightHomePage {
  readonly page: Page;
  readonly gettingStartedLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.gettingStartedLink = page.getByRole('link', { name: 'Get started' });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async openGettingStarted(): Promise<void> {
    await this.gettingStartedLink.click();
  }
}
