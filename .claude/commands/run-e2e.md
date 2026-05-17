# Run E2E Tests

You are setting up and running the E2E test suite. Execute each step directly. Do not explain commands — just run them. Only stop to ask the user if something fails or a choice is needed.

## 1. Check and install prerequisites

Run `node --version`. If the version is below 24.11 or node is not found, stop and tell the user to install Node.js >= 24.11 (this requires manual action).

Run `pnpm --version`. If pnpm is not found or version is below 11.1.2, ask the user: "pnpm is missing or outdated. Can I install it with `npm install -g pnpm@11`?" Only proceed if they agree.

## 2. Install dependencies

Ask the user: "Can I run `pnpm install` to install project dependencies?" Only proceed if they agree.

## 3. Install Playwright browsers

Ask the user: "Can I run `pnpm -C tests test:install` to install Playwright browsers?" Only proceed if they agree.

## 4. Verify the application is running

Use Node to check if localhost:3000 is reachable:
```
node -e "fetch('http://localhost:3000').then(r => console.log('OK: ' + r.status)).catch(() => console.log('UNREACHABLE'))"
```

If unreachable, tell the user to start the app with `docker compose -f docker-compose-dev.yml up` and wait for them to confirm before continuing.

## 5. Ask how to run the tests

Ask the user which mode they want using these options:

- **All tests** — `pnpm -C tests test`
- **All tests (single worker)** — `pnpm -C tests exec playwright test --workers=1`
- **Headed mode (visible browser)** — `pnpm -C tests test:headed`
- **UI mode (interactive)** — `pnpm -C tests test:ui`
- **Debug mode (step through)** — `pnpm -C tests test:debug`
- **Specific spec file** — ask which file, then run `pnpm -C tests exec playwright test e2e/specs/<file>.spec.ts`
- **View last report** — `pnpm -C tests test:report`

## 6. Run and report

Execute the chosen command and report the results (pass/fail count, any failures).
