import { test, expect } from '../fixtures/test.js';

test.describe('Playwright home page', () => {
  test('allows users to start the documentation journey @smoke @critical', async ({
    homePage,
    page,
  }) => {
    await homePage.open();

    await expect(page).toHaveTitle(/Playwright/);
    await expect(homePage.gettingStartedLink).toBeVisible();

    await homePage.openGettingStarted();
    await expect(page).toHaveURL(/.*docs\/intro/);
  });
});
