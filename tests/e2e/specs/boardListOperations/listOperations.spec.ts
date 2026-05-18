import { test, expect } from '@playwright/test';
import { ListPage } from '../../pageObjects/ListPage';
import { ROLES } from '../../testData';
import { loginAndNavigateToBoard, LIST_01 } from '../../utils';

test.describe('TC06: Create a List - Role Based Access', () => {

  for (const role of ROLES) {

    // TEST: Verify list creation is only available to editors
    // RESULT: Editors can create a list and see it on the board; non-editors do not see the "Add list" button

    test(`${role.name} - create a list`, async ({ page }) => {
      await loginAndNavigateToBoard(page, role.user.username, role.user.password);
      const listPage = new ListPage(page);
      const listName = `TC06 List ${role.name} ${Date.now()}`;

      if (role.canEditBoard) {
        await listPage.createList(listName);
        await expect(listPage.listTitle(listName)).toBeVisible();

        await listPage.deleteList(listName);
        await expect(listPage.listTitle(listName)).toHaveCount(0);
      } else {
        await expect(listPage.addListButton).toHaveCount(0);
      }
    });
  }
});

test.describe('TC07: Rename a List - Role Based Access', () => {
  for (const role of ROLES) {

    // TEST: Verify list renaming is only available to editors
    // RESULT: Editors can click the list title to rename it; non-editors clicking the title does not open the edit field

    test(`${role.name} - rename list behavior`, async ({ page }) => {
      await loginAndNavigateToBoard(page, role.user.username, role.user.password);
      const listPage = new ListPage(page);

      if (role.canEditBoard) {
        const listName = `TC07 List ${role.name} ${Date.now()}`;
        const renamedName = `${listName} Renamed`;

        await listPage.createList(listName);
        await expect(listPage.listTitle(listName)).toBeVisible();

        await listPage.renameList(listName, renamedName);
        await expect(listPage.listTitle(renamedName)).toBeVisible();

        await listPage.deleteList(renamedName);
        await expect(listPage.listTitle(renamedName)).toHaveCount(0);
      } else {
        await listPage.listTitle(LIST_01).first().click();
        await expect(listPage.listNameField).toHaveCount(0);
      }
    });
  }
});

test.describe('TC08: Reorder Lists (Drag-and-Drop) - Role Based Access', () => {

  for (const role of ROLES) {

    // TEST: Verify drag-and-drop list reordering is only available to editors
    // RESULT: Editors can drag a list to a new position and the order changes; non-editors have draggable disabled

    test(`${role.name} - reorder list behavior`, async ({ page }) => {
      await loginAndNavigateToBoard(page, role.user.username, role.user.password);
      const listPage = new ListPage(page);

      if (role.canEditBoard) {
        const listA = `TC08 A ${role.name} ${Date.now()}`;
        const listB = `TC08 B ${role.name} ${Date.now()}`;
        const listC = `TC08 C ${role.name} ${Date.now()}`;

        await listPage.openAddListForm();
        for (const name of [listA, listB, listC]) {
          await listPage.listNameField.fill(name);
          await listPage.listNameField.press('Enter');
          await expect(listPage.listTitle(name)).toBeVisible();
        }
        await listPage.closeAddListForm();

        await listPage.dragList(listA, listC);

        const allTitles = await listPage.getListOrder();
        const indexA = allTitles.findIndex(t => t === listA);
        const indexB = allTitles.findIndex(t => t === listB);
        expect(indexB).toBeLessThan(indexA);

        for (const name of [listA, listB, listC]) {
          await listPage.deleteList(name);
          await expect(listPage.listTitle(name)).toHaveCount(0);
        }
      } else {
        const listWrapper = page.locator('[data-drag-scroller]').first();
        await expect(listWrapper).not.toHaveAttribute('draggable', 'true');
      }
    });
  }
});

test.describe('TC09: Collapse/Expand a List - Role Based Access', () => {

  for (const role of ROLES) {

    // TEST: Verify collapse/expand is only functional for editors (canEdit must be true)
    // RESULT: Editors can collapse a list and expand it back; non-editors clicking collapse has no effect

    test(`${role.name} - collapse/expand list behavior`, async ({ page }) => {
      await loginAndNavigateToBoard(page, role.user.username, role.user.password);
      const listPage = new ListPage(page);

      if (role.canEditBoard) {
        const listName = `TC09 List ${role.name} ${Date.now()}`;

        await listPage.createList(listName);
        await expect(listPage.listTitle(listName)).toBeVisible();
        await listPage.closeAddListForm();

        // Collapse: the entire list re-renders into a collapsed layout
        await listPage.collapseList(listName);
        await expect(listPage.expandButton(listName)).toBeVisible();

        // Expand: list returns to full layout
        await listPage.expandList(listName);
        await expect(listPage.collapseButton(listName)).toBeVisible();

        await listPage.deleteList(listName);
        await expect(listPage.listTitle(listName)).toHaveCount(0);
      } else {
        // Non-editors: collapse button is visible but clicking it has no effect (canEdit is false)
        // Count expand buttons before clicking
        const expandCountBefore = await page.getByTitle('Expand List').count();
        const collapseButton = page.getByTitle('Collapse List').first();
        await expect(collapseButton).toBeVisible();
        await collapseButton.click();
        await page.waitForTimeout(500);

        // Verify no new expand button appeared (count unchanged)
        const expandCountAfter = await page.getByTitle('Expand List').count();
        expect(expandCountAfter).toBe(expandCountBefore);
      }
    });
  }
});

test.describe('TC10: Delete a List - Role Based Access', () => {

  for (const role of ROLES) {

    // TEST: Verify list deletion is only available to editors
    // RESULT: Editors can delete a list via the menu; non-editors do not see the "Delete List" option in the menu

    test(`${role.name} - delete list behavior`, async ({ page }) => {
      await loginAndNavigateToBoard(page, role.user.username, role.user.password);
      const listPage = new ListPage(page);

      if (role.canEditBoard) {
        const listName = `TC10 List ${role.name} ${Date.now()}`;

        await listPage.createList(listName);
        await expect(listPage.listTitle(listName)).toBeVisible();

        await listPage.deleteList(listName);
        await expect(listPage.listTitle(listName)).toHaveCount(0);
      } else {
        await listPage.openListMenu(LIST_01);
        await expect(page.getByRole('button', { name: 'Delete List' })).toHaveCount(0);
        await page.keyboard.press('Escape');
      }
    });
  }
});
