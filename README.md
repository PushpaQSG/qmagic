# Enterprise QA Automation

Playwright and TypeScript test automation framework with reusable page objects, typed fixtures, multi-browser coverage, CI reporting, and strict quality gates.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Setup

```bash
npm install
npm run install:browsers
copy .env.example .env
```

Set `BASE_URL` in `.env` to the application under test. The default smoke test uses `https://playwright.dev` so the framework can be verified immediately.

## Common commands

```bash
npm test                 # Run all browser projects
npm run test:smoke       # Run tests tagged @smoke
npm run test:headed      # Run with a visible browser
npm run test:debug       # Open Playwright Inspector
npm run test:ui          # Open Playwright UI mode
npm run report           # Open the latest HTML report
npm run typecheck        # Run TypeScript validation
npm run lint             # Run ESLint
npm run format:check     # Verify formatting
```

## Project structure

```text
src/
  config/                Environment configuration
  pages/                 Page objects and UI abstractions
tests/
  fixtures/              Shared typed Playwright fixtures
  smoke/                 Fast confidence checks
playwright.config.ts     Browser projects, retries, artifacts, and reporters
```

## Test conventions

- Prefer accessible locators such as roles, labels, and test IDs.
- Keep selectors and UI actions inside page objects.
- Use fixtures for shared setup and dependency injection.
- Tag release-blocking coverage with `@critical` and fast confidence checks with `@smoke`.
- Keep credentials and environment-specific values outside source control.

## CI

GitHub Actions runs install, browser setup, type checking, linting, formatting validation, and the full Playwright suite. HTML, JUnit, traces, screenshots, and videos are uploaded when available.
