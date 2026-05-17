# E2E Tests

End-to-end tests for 4ga Boards using [Playwright](https://playwright.dev/).

## Prerequisites

- Node.js >= 24.11 ([download](https://nodejs.org/))
- pnpm >= 11.1.2
- Docker (for running the app locally)
- The application running at `http://localhost:3000`

## Setup

1. Install or upgrade Node.js (v24.11+):

```bash
# Check current version
node --version

# Install/upgrade via nvm (recommended)
nvm install 24
nvm use 24
```

2. Install pnpm (if not already installed):

```bash
npm install -g pnpm@11
```

3. Install dependencies:

```bash
pnpm install
```

4. Install Playwright browsers:

```bash
pnpm -C tests test:install
```

5. Start the application (from the project root):

```bash
docker compose -f docker-compose.yml up
```

## Running Tests

From the project root:

```bash
# Run all tests
pnpm test:e2e

# Run all tests (from tests/ directory)
cd tests && pnpm test
```

From the `tests/` directory:

```bash
# Run all tests
pnpm test

# Run a specific spec file
npx playwright test e2e/specs/boardListOperations/boardOperations.spec.ts

# Run tests in headed mode (visible browser)
pnpm test:headed

# Run with Playwright UI mode (interactive)
pnpm test:ui

# Run in debug mode (step through tests)
pnpm test:debug

# Run with single worker (avoids parallel flakiness)
npx playwright test --workers=1

# View the HTML test report
pnpm test:report
```

## Test Structure

```
tests/
├── e2e/
│   ├── setup.spec.ts              # Seeds test data (runs before all tests)
│   ├── utils.ts                   # Shared helpers (login, API utilities, constants)
│   ├── testData.ts                # Test users, roles, and project constants
│   ├── pageObjects/
│   │   ├── LoginPage.ts           # Login page interactions
│   │   ├── BoardPage.ts           # Board CRUD operations
│   │   ├── ListPage.ts            # List CRUD operations
│   │   └── UserSettingPage.ts     # User management page
│   └── specs/
│       ├── login.spec.ts              # Basic login test
│       ├── addUser.spec.ts            # User creation test
│       └── boardListOperations/
│           ├── boardOperations.spec.ts    # TC01-TC05: Board CRUD (role-based)
│           ├── listOperations.spec.ts     # TC06-TC10: List CRUD (role-based)
│           ├── pmBehavior.spec.ts         # TC11-TC13: Project Manager behavior
│           ├── dynamicRoleChanges.spec.ts # TC14-TC16: Role upgrades/downgrades
│           ├── validationTests.spec.ts    # TC17-TC20: Input validation
│           ├── persistenceTests.spec.ts   # TC21-TC24: Data persists after reload
│           └── realTimeTests.spec.ts      # TC25-TC29: WebSocket broadcasts
└── playwright.config.ts           # Playwright configuration
```

## Test Cases

| ID | Test | Spec File |
|----|------|-----------|
| TC01 | Create Board (role-based) | boardListOperations/boardOperations.spec.ts |
| TC02 | Rename Board (role-based) | boardListOperations/boardOperations.spec.ts |
| TC03 | Delete Board (role-based) | boardListOperations/boardOperations.spec.ts |
| TC04 | View Board (role-based) | boardListOperations/boardOperations.spec.ts |
| TC05 | Manage Board Memberships (role-based) | boardListOperations/boardOperations.spec.ts |
| TC06 | Create List (role-based) | boardListOperations/listOperations.spec.ts |
| TC07 | Rename List (role-based) | boardListOperations/listOperations.spec.ts |
| TC08 | Reorder Lists - drag-and-drop (role-based) | boardListOperations/listOperations.spec.ts |
| TC09 | Collapse/Expand List (role-based) | boardListOperations/listOperations.spec.ts |
| TC10 | Delete List (role-based) | boardListOperations/listOperations.spec.ts |
| TC11 | PM has auto-editor on all boards | boardListOperations/pmBehavior.spec.ts |
| TC12 | PM cannot be removed from board | boardListOperations/pmBehavior.spec.ts |
| TC13 | Promoting user to PM grants board access | boardListOperations/pmBehavior.spec.ts |
| TC14 | Role upgrade: Viewer to Editor | boardListOperations/dynamicRoleChanges.spec.ts |
| TC15 | Role downgrade: Editor to Viewer | boardListOperations/dynamicRoleChanges.spec.ts |
| TC16 | Membership revocation | boardListOperations/dynamicRoleChanges.spec.ts |
| TC17 | Reject board creation with empty name | boardListOperations/validationTests.spec.ts |
| TC18 | Reject list creation with empty name | boardListOperations/validationTests.spec.ts |
| TC19 | Accept duplicate list names | boardListOperations/validationTests.spec.ts |
| TC20 | Long list name handling | boardListOperations/validationTests.spec.ts |
| TC21 | Board name persists after reload | boardListOperations/persistenceTests.spec.ts |
| TC22 | List order persists after reload | boardListOperations/persistenceTests.spec.ts |
| TC23 | Collapsed state persists after reload | boardListOperations/persistenceTests.spec.ts |
| TC24 | Deleted list does not reappear | boardListOperations/persistenceTests.spec.ts |
| TC25 | List creation broadcasts (WebSocket) | boardListOperations/realTimeTests.spec.ts |
| TC26 | List deletion broadcasts (WebSocket) | boardListOperations/realTimeTests.spec.ts |
| TC27 | List rename broadcasts (WebSocket) | boardListOperations/realTimeTests.spec.ts |
| TC28 | List reorder broadcasts (WebSocket) | boardListOperations/realTimeTests.spec.ts |
| TC29 | Board deletion notifies members (WebSocket) | boardListOperations/realTimeTests.spec.ts |

## Test Data

The setup spec (`setup.spec.ts`) runs before all tests and creates the following automatically:

- **Project**: "Project 01" (created if not exists)
- **Board**: "Board 01" inside Project 01 (created if not exists)
- **Users** (created if not exist):

| Username | Role | Board Access |
|----------|------|--------------|
| `demo` | Admin | Full access (pre-seeded) |
| `pm_user` | Project Manager | Auto-editor on all boards |
| `editor_user` | Board Editor | Can create/edit/delete lists |
| `commenter_user` | Board Commenter | Read-only + comments |
| `viewer_user` | Board Viewer | Read-only |
| `non_member_user` | Non-Member | No board access |

All passwords for test users: `Test@12345`

## Notes

- Tests use Chromium by default (configured in `playwright.config.ts`)
- The setup project runs as a dependency before all test specs
- When running in parallel (default), some tests may flake due to server load — use `--workers=1` for reliable runs
- WebSocket/real-time tests (TC25-TC29) use multiple browser contexts to simulate concurrent sessions

## Agentic AI Usage

This E2E test suite was authored using agentic AI (Claude Code) with the following workflow:

1. **Functional Flow Analysis** — Used AI to understand the application's architecture, user workflows, and feature interactions. The output is documented in `docs/FUNCTIONAL_FLOW.md`.

2. **E2E Strategy** — Used AI to narrow down the most important features to test and prioritize coverage. The result is stored in `docs/E2E_TEST_STRATEGY.md`.

3. **Test Procedure** — A structured test procedure document was created using the skill at `docs/CREATE_TEST_PROCEDURE.md`. The resulting test plan lives at `docs/TEST_PROCEDURE_BOARD_LIST.md`.

4. **Test Implementation** — Worked on implementing the tests by keeping a human in the loop for every test added. Provided the initial test stubs and progressed while improving test readability and reusability. Followed one test at a time while reviewing, optimizing, and identifying issues with the tests.

5. **Setup & Run Skill** — A Claude Code skill at `.claude/commands/run-e2e.md` automates environment setup (Node.js, pnpm, Playwright browsers) and provides guided test execution for anyone cloning the repo.

**Manual Interventions:**
- Understood what AI assumes: existing users, project, list, and board
- Identified reusable functions and extracted them into shared utilities
- Understood system flaws: PM removal in UI allows confirmation but silently fails (no error shown)
- Added teardown and cleanups when AI missed them
- Created interactive and platform-agnostic skill file to get the project set up and running
- Stepped in when AI used keyboard interactions instead of UI to achieve an action
- Guided AI to find correct selectors by reading React component source code in `client/src`
- Assisted AI in creating platform Agnostic test setup skill file




### Key files

| File | Purpose |
|------|---------|
| `docs/FUNCTIONAL_FLOW.md` | AI-generated analysis of application architecture and user workflows |
| `docs/E2E_TEST_STRATEGY.md` | AI-assisted prioritization of features for E2E coverage |
| `docs/CREATE_TEST_PROCEDURE.md` | Skill used to generate structured test procedures |
| `docs/TEST_PROCEDURE_BOARD_LIST.md` | The test procedure that defines all test cases (TC01-TC29) |
| `.claude/commands/run-e2e.md` | Skill to set up prerequisites and run E2E tests |
