import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import prisma from '@/libs/prismadb';
import { POST } from '@/app/api/user/support/update/route';
import { jsonRequest, responseText } from '../helpers/request';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/libs/prismadb', () => ({
  default: {
    support: {
      updateMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

const URL = 'http://localhost/api/user/support/update';

describe('POST /api/user/support/update (P0-1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await POST(
      jsonRequest(URL, { supportId: 's1', field: 'status', value: 'Closed' })
    );

    expect(response.status).toBe(401);
    expect(await responseText(response)).toBe('User not authenticated.');
  });

  it('returns 403 when non-support user cannot update another users ticket', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-a', support: false },
    } as never);
    vi.mocked(prisma.support.updateMany).mockResolvedValue({ count: 0 });

    const response = await POST(
      jsonRequest(URL, { supportId: 'other-support', field: 'status', value: 'Closed' })
    );

    expect(response.status).toBe(403);
    expect(await responseText(response)).toBe('Not found or forbidden.');
    expect(prisma.support.updateMany).toHaveBeenCalledWith({
      where: { supportId: 'other-support', staffsId: 'user-a' },
      data: { status: 'Closed' },
    });
    expect(prisma.support.findUnique).not.toHaveBeenCalled();
  });

  it('updates own ticket when user lacks support permission', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-a', support: false },
    } as never);
    vi.mocked(prisma.support.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.support.findUnique).mockResolvedValue({
      supportId: 'own-support',
      status: 'Closed',
    } as never);

    const response = await POST(
      jsonRequest(URL, { supportId: 'own-support', field: 'status', value: 'Closed' })
    );

    expect(response.status).toBe(200);
    expect(prisma.support.updateMany).toHaveBeenCalledWith({
      where: { supportId: 'own-support', staffsId: 'user-a' },
      data: { status: 'Closed' },
    });
    await expect(response.json()).resolves.toEqual({
      supportId: 'own-support',
      status: 'Closed',
    });
  });

  it('allows support user to update any ticket without staffsId constraint', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'support-user', support: true },
    } as never);
    vi.mocked(prisma.support.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.support.findUnique).mockResolvedValue({
      supportId: 'any-support',
      status: 'Progress',
    } as never);

    const response = await POST(
      jsonRequest(URL, { supportId: 'any-support', field: 'status', value: 'Progress' })
    );

    expect(response.status).toBe(200);
    expect(prisma.support.updateMany).toHaveBeenCalledWith({
      where: { supportId: 'any-support' },
      data: { status: 'Progress' },
    });
  });
});
