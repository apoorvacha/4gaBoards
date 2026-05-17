# Run E2E Tests

Check prerequisites, install missing dependencies, run setup, and execute E2E tests.

## Steps

1. **Check Node.js version** (requires >= 24.11):
   - Run `node --version`
   - If not installed or version < 24.11, inform the user they need to install/upgrade Node.js:
     - **Windows**: `nvm install 24` and `nvm use 24` (using [nvm-windows](https://github.com/coreybutler/nvm-windows)), or download from https://nodejs.org/
     - **macOS/Linux**: `nvm install 24` and `nvm use 24` (using [nvm](https://github.com/nvm-sh/nvm))
   - If Node.js is missing entirely, stop and tell the user to install it first.

2. **Check pnpm** (requires >= 11.1.2):
   - Run `pnpm --version`
   - If not found, install it: `npm install -g pnpm@11`
   - If version < 11.1.2, upgrade it: `npm install -g pnpm@11`

3. **Install project dependencies**:
   - Run `pnpm install` from the project root (the directory containing the top-level `package.json`)

4. **Install Playwright browsers**:
   - Run `pnpm -C tests test:install`

5. **Check if the application is running**:
   - Attempt to reach `http://localhost:3000`:
     - **macOS/Linux**: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
     - **Windows (PowerShell)**: `(Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing -ErrorAction SilentlyContinue).StatusCode`
     - Or simply use Node: `node -e "fetch('http://localhost:3000').then(r => console.log(r.status)).catch(() => console.log('unreachable'))"`
   - If not reachable, inform the user:
     ```
     The app is not running at http://localhost:3000.
     Start it with: docker compose -f docker-compose-dev.yml up
     ```
   - Wait for the user to confirm the app is running before proceeding.

6. **Ask the user how they want to run the tests** with these options:
   - **Run all tests** — `pnpm -C tests test`
   - **Run all tests (single worker, more reliable)** — `pnpm -C tests exec playwright test --workers=1`
   - **Run in headed mode (visible browser)** — `pnpm -C tests test:headed`
   - **Run with Playwright UI (interactive)** — `pnpm -C tests test:ui`
   - **Run in debug mode (step through)** — `pnpm -C tests test:debug`
   - **Run a specific spec file** — ask which file, then run `pnpm -C tests exec playwright test e2e/specs/<file>.spec.ts`
   - **View last test report** — `pnpm -C tests test:report`

7. **Run the selected command** from the project root and report results.
