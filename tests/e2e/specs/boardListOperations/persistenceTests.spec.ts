import { test, expect } from '@playwright/test';
import { BoardPage } from '../../pageObjects/BoardPage';
import { ListPage } from '../../pageObjects/ListPage';
import { ADMIN, TEST_PROJECT_NAME } from '../../testData';
import { loginToDashboard, loginAndNavigateToBoard, getAdminToken, getBoardId, BASE_URL, BOARD_01 } from '../../utils';

test.describe('TC21: Board name persists after reload', () => {

  // TEST: Verify that a newly created board name displays correctly after page reload
  // RESULT: Board name is visible in sidebar after reload

  test('Board name persists after page reload', async ({ page }) => {
    await loginToDashboard(page, ADMIN.username, ADMIN.password);
    const boardPage = new BoardPage(page);

    const boardName = `TC21 Board ${Date.now()}`;
    await boardPage.createBoard(boardName, TEST_PROJECT_NAME);
    await expect(boardPage.boardInSidebar(boardName)).toBeVisible();

    // Navigate into the board, then reload
    await boardPage.navigateToBoard(boardName, TEST_PROJECT_NAME);
    await page.reload();
    await page.getByRole('button', { name: 'Back to Project' }).waitFor({ state: 'visible', timeout: 10000 });

    // Verify board title still visible after reload
    await expect(boardPage.boardTitle(boardName)).toBeVisible();

    // Cleanup
    await boardPage.deleteBoard(boardName);
    await expect(page.getByRole('button', { name: boardName, exact: true })).toHaveCount(0, { timeout: 10000 });
  });
});

test.describe('TC22: List order persists after reload', () => {

  // TEST: Verify that reordered lists maintain their positions after page reload
  // RESULT: Lists remain in the reordered position after refresh

  test('List order persists after page reload', async ({ page }) => {
    test.setTimeout(90000);
    await loginAndNavigateToBoard(page, ADMIN.username, ADMIN.password);
    const listPage = new ListPage(page);

    const listA = `TC22 A ${Date.now()}`;
    const listB = `TC22 B ${Date.now()}`;
    const listC = `TC22 C ${Date.now()}`;

    // Create 3 lists in order A, B, C
    await listPage.openAddListForm();
    for (const name of [listA, listB, listC]) {
      await listPage.listNameField.fill(name);
      await listPage.listNameField.press('Enter');
      await expect(listPage.listTitle(name)).toBeVisible();
    }
    await listPage.closeAddListForm();

    // Reorder: drag A past C
    await listPage.dragList(listA, listC);

    // Verify new order (B before A)
    const orderBefore = await listPage.getListOrder();
    const indexABefore = orderBefore.findIndex(t => t === listA);
    const indexBBefore = orderBefore.findIndex(t => t === listB);
    expect(indexBBefore).toBeLessThan(indexABefore);

    // Reload the page
    await page.reload();
    await page.getByRole('button', { name: 'Back to Project' }).waitFor({ state: 'visible', timeout: 10000 });

    // Verify order is maintained after reload
    const orderAfter = await listPage.getListOrder();
    const indexAAfter = orderAfter.findIndex(t => t === listA);
    const indexBAfter = orderAfter.findIndex(t => t === listB);
    expect(indexBAfter).toBeLessThan(indexAAfter);

    // Cleanup via API (more reliable than UI when board has many lists)
    const { apiContext, token } = await getAdminToken();
    const boardId = await getBoardId(apiContext, token, BOARD_01);
    const boardRes = await apiContext.get(`${BASE_URL}/api/boards/${boardId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const boardData = await boardRes.json();
    for (const name of [listA, listB, listC]) {
      const list = boardData.included.lists.find((l: any) => l.name === name);
      if (list) {
        await apiContext.delete(`${BASE_URL}/api/lists/${list.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    }
    await apiContext.dispose();
  });
});

test.describe('TC23: Collapsed state persists after reload', () => {

  // TEST: Verify that a collapsed list remains collapsed after page reload
  // RESULT: List shows expand button (collapsed state) after refresh

  test('Collapsed list remains collapsed after page reload', async ({ page }) => {
    await loginAndNavigateToBoard(page, ADMIN.username, ADMIN.password);
    const listPage = new ListPage(page);

    const listName = `TC23 List ${Date.now()}`;
    await listPage.createList(listName);
    await expect(listPage.listTitle(listName)).toBeVisible();
    await listPage.closeAddListForm();

    // Collapse the list
    await listPage.collapseList(listName);
    await expect(listPage.expandButton(listName)).toBeVisible();

    // Reload the page
    await page.reload();
    await page.getByRole('button', { name: 'Back to Project' }).waitFor({ state: 'visible', timeout: 10000 });

    // Verify list is still collapsed (expand button visible)
    await expect(listPage.expandButton(listName)).toBeVisible();

    // Cleanup: expand then delete
    await listPage.expandList(listName);
    await listPage.deleteList(listName);
    await expect(listPage.listTitle(listName)).toHaveCount(0);
  });
});

test.describe('TC24: Deleted list does not reappear', () => {

  // TEST: Verify that a deleted list does not reappear after page reload
  // RESULT: List remains gone after refresh

  test('Deleted list does not reappear after page reload', async ({ page }) => {
    await loginAndNavigateToBoard(page, ADMIN.username, ADMIN.password);
    const listPage = new ListPage(page);

    const listName = `TC24 List ${Date.now()}`;
    await listPage.createList(listName);
    await expect(listPage.listTitle(listName)).toBeVisible();
    await listPage.closeAddListForm();

    // Delete the list
    await listPage.deleteList(listName);
    await expect(listPage.listTitle(listName)).toHaveCount(0);

    // Reload the page
    await page.reload();
    await page.getByRole('button', { name: 'Back to Project' }).waitFor({ state: 'visible', timeout: 10000 });

    // Verify list is still gone
    await expect(listPage.listTitle(listName)).toHaveCount(0, { timeout: 3000 });
  });
});