# Setup & Run E2E Tests

You are helping a developer set up and run the E2E test suite for this project from scratch. This should work on any machine (Windows, macOS, Linux) that has the repo cloned. Execute each step. Ask for permission before installing anything. Stop and guide the user if manual action is required.

## 1. Check Node.js

Run `node --version`.

- If node is not found or version is below 24.11: check if nvm is available by running `nvm --version`. If nvm is available, ask the user "Node.js >= 24.11 is required (current: <version or not found>). Can I install it with `nvm install 24 && nvm use 24`?" If they agree, run it. If nvm is not available, download and install Node.js using the appropriate method for the OS — ask the user for permission first.
- If version is >= 24.11: continue.

## 2. Check and install pnpm

Run `pnpm --version`.

- If pnpm is not found or version is below 11.1.2: ask the user "pnpm is missing or outdated (need >= 11.1.2). Can I install it with `npm install -g pnpm@11`?" Only run if they agree.
- If pnpm is >= 11.1.2: continue.

## 3. Install project dependencies

Ask the user: "Can I run `pnpm install` to install project dependencies?"

If they agree, run `pnpm install` from the project root.

## 4. Install Playwright browsers

Ask the user: "Can I install Playwright browsers with `pnpm -C tests test:install`?"

If they agree, run `pnpm -C tests test:install`.

## 5. Check if the application is running

Run:
```
node -e "fetch('http://localhost:3000').then(r => console.log('OK: ' + r.status)).catch(() => console.log('UNREACHABLE'))"
```

- If OK: continue.
- If UNREACHABLE: tell the user the app needs to be running at http://localhost:3000. Suggest starting it with:
  ```
  docker compose -f docker-compose-dev.yml up
  ```
  Wait for the user to confirm the app is running before continuing.

## 6. Choose test run mode

Ask the user how they want to run the tests. Present these options:

- **All tests** — `pnpm -C tests test`
- **All tests (single worker, recommended for first run)** — `pnpm -C tests exec playwright test --workers=1`
- **Headed mode (see the browser)** — `pnpm -C tests test:headed`
- **UI mode (interactive Playwright panel)** — `pnpm -C tests test:ui`
- **Debug mode (step through tests)** — `pnpm -C tests test:debug`
- **Specific spec file** — ask which file from: `boardOperations`, `listOperations`, `pmBehavior`, `dynamicRoleChanges`, `validationTests`, `persistenceTests`, `realTimeTests`, `login`, `addUser`. Then run `pnpm -C tests exec playwright test e2e/specs/<chosen>.spec.ts`
- **View last test report** — `pnpm -C tests test:report`

## 7. Run and report

Execute the chosen command and report results: total tests, passed, failed, and any failure details.
