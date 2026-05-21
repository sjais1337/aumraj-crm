import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import prisma from '@/libs/prismadb';
import { POST } from '@/app/api/user/tasks/remark/route';
import { jsonRequest, responseText } from '../helpers/request';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/libs/prismadb', () => ({
  default: {
    tasks: {
      updateMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

const URL = 'http://localhost/api/user/tasks/remark';

describe('POST /api/user/tasks/remark (P0-3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await POST(
      jsonRequest(URL, { id: 'task-1', remark: 'Done for today' })
    );

    expect(response.status).toBe(401);
  });

  it('returns 403 when completing another users task', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-a' },
    } as never);
    vi.mocked(prisma.tasks.updateMany).mockResolvedValue({ count: 0 });

    const response = await POST(
      jsonRequest(URL, { id: 'user-b-task', remark: 'Should not apply' })
    );

    expect(response.status).toBe(403);
    expect(await responseText(response)).toBe('Not found or forbidden.');
    expect(prisma.tasks.updateMany).toHaveBeenCalledWith({
      where: { id: 'user-b-task', staffsId: 'user-a' },
      data: {
        remark: 'Should not apply',
        taskChecked: true,
        markTime: expect.any(Date),
      },
    });
    expect(prisma.tasks.findUnique).not.toHaveBeenCalled();
  });

  it('completes own task with remark', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-a' },
    } as never);
    vi.mocked(prisma.tasks.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.tasks.findUnique).mockResolvedValue({
      id: 'own-task',
      remark: 'Completed work',
      taskChecked: true,
    } as never);

    const response = await POST(
      jsonRequest(URL, { id: 'own-task', remark: 'Completed work' })
    );

    expect(response.status).toBe(200);
    expect(prisma.tasks.updateMany).toHaveBeenCalledWith({
      where: { id: 'own-task', staffsId: 'user-a' },
      data: {
        remark: 'Completed work',
        taskChecked: true,
        markTime: expect.any(Date),
      },
    });
    await expect(response.json()).resolves.toEqual({
      id: 'own-task',
      remark: 'Completed work',
      taskChecked: true,
    });
  });
});
