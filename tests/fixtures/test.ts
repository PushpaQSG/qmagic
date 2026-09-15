import { test as base } from '@playwright/test';

import { PlaywrightHomePage } from '../../src/pages/PlaywrightHomePage.js';

type Fixtures = {
  homePage: PlaywrightHomePage;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new PlaywrightHomePage(page));
  },
});

export { expect } from '@playwright/test';
