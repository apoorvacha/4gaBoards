import { test, request } from '@playwright/test';
import { ADMIN, TEST_USERS, TEST_PROJECT_NAME } from './testData';
import { BASE_URL, BOARD_01, LIST_01 } from './utils';

test('seed test users and assign roles', async () => {
  const apiContext = await request.newContext();

  // 1. Authenticate as admin
  const authRes = await apiContext.post(`${BASE_URL}/api/access-tokens`, {
    data: { emailOrUsername: ADMIN.username, password: ADMIN.password },
  });
  const { item: token } = await authRes.json();

  // 2. Find or create "Project 01"
  const projectsRes = await apiContext.get(`${BASE_URL}/api/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const projectsBody = await projectsRes.json();
  let project = projectsBody.items.find((p: any) => p.name === TEST_PROJECT_NAME);

  if (!project) {
    const createProjectRes = await apiContext.post(`${BASE_URL}/api/projects`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: TEST_PROJECT_NAME },
    });
    if (!createProjectRes.ok()) {
      throw new Error(`Failed to create project: ${createProjectRes.status()} ${await createProjectRes.text()}`);
    }
    const createProjectBody = await createProjectRes.json();
    project = createProjectBody.item;
    console.log(`[Setup] Created project: "${project.name}" (${project.id})`);
  }

  // 3. Find or create "Board 01" in the project
  const projectRes = await apiContext.get(`${BASE_URL}/api/projects/${project.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const projectBody = await projectRes.json();
  let firstBoard = projectBody.included.boards.find((b: any) => b.name === BOARD_01);

  if (!firstBoard) {
    const createBoardRes = await apiContext.post(`${BASE_URL}/api/projects/${project.id}/boards`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: BOARD_01, position: 65536, isGithubConnected: false },
    });
    if (!createBoardRes.ok()) {
      throw new Error(`Failed to create board: ${createBoardRes.status()} ${await createBoardRes.text()}`);
    }
    const createBoardBody = await createBoardRes.json();
    firstBoard = createBoardBody.item;
    console.log(`[Setup] Created board: "${firstBoard.name}" (${firstBoard.id})`);
  }

  console.log(`[Setup] Project: "${project.name}" (${project.id}), Board: "${firstBoard.name}" (${firstBoard.id})`);

  // 3b. Find or create "List 01" in the board
  const boardRes2 = await apiContext.get(`${BASE_URL}/api/boards/${firstBoard.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const boardBody = await boardRes2.json();
  let firstList = boardBody.included.lists.find((l: any) => l.name === LIST_01);

  if (!firstList) {
    const createListRes = await apiContext.post(`${BASE_URL}/api/boards/${firstBoard.id}/lists`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: LIST_01, position: 65536, isCollapsed: false },
    });
    if (!createListRes.ok()) {
      throw new Error(`Failed to create list: ${createListRes.status()} ${await createListRes.text()}`);
    }
    const createListBody = await createListRes.json();
    firstList = createListBody.item;
    console.log(`[Setup] Created list: "${firstList.name}" (${firstList.id})`);
  }

  // 4. Create users (idempotent — skips if already exists)
  const userIds: Record<string, string> = {};
  for (const [role, userData] of Object.entries(TEST_USERS)) {
    const res = await apiContext.post(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { email: userData.email, password: userData.password, name: userData.name, username: userData.username },
    });

    if (res.ok()) {
      const body = await res.json();
      userIds[role] = body.item.id;
    } else if (res.status() === 409) {
      const allUsersRes = await apiContext.get(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allUsersBody = await allUsersRes.json();
      const existing = allUsersBody.items.find((u: any) => u.username === userData.username || u.email === userData.email);
      userIds[role] = existing.id;
    } else {
      throw new Error(`Failed to create user ${role}: ${res.status()} ${await res.text()}`);
    }
  }

  console.log(`[Setup] Users: pm=${userIds.pm}, editor=${userIds.editor}, commenter=${userIds.commenter}, viewer=${userIds.viewer}, nonMember=${userIds.nonMember}`);

  // 5. Assign roles (create or reset to correct role)
  // PM → Project Manager
  await apiContext.post(`${BASE_URL}/api/projects/${project.id}/managers`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { userId: userIds.pm },
  });

  // Helper: create membership or reset existing one to the correct role
  const ensureMembership = async (userId: string, role: string, canComment?: boolean) => {
    const createRes = await apiContext.post(`${BASE_URL}/api/boards/${firstBoard.id}/memberships`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { userId, role, ...(canComment !== undefined && { canComment }) },
    });
    if (createRes.status() === 409) {
      // Membership exists — find it and patch to the correct role
      const boardRes = await apiContext.get(`${BASE_URL}/api/boards/${firstBoard.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const boardData = await boardRes.json();
      const membership = boardData.included.boardMemberships.find((bm: any) => bm.userId === userId);
      if (membership) {
        await apiContext.patch(`${BASE_URL}/api/board-memberships/${membership.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { role, ...(canComment !== undefined && { canComment }) },
        });
      }
    }
  };

  // Editor → Board editor
  await ensureMembership(userIds.editor, 'editor');

  // Commenter → Board viewer with canComment
  await ensureMembership(userIds.commenter, 'viewer', true);

  // Viewer → Board viewer without canComment
  await ensureMembership(userIds.viewer, 'viewer', false);

  console.log('[Setup] Roles assigned successfully');

  await apiContext.dispose();
});
