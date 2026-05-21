import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import prisma from '@/libs/prismadb';
import { POST } from '@/app/api/group/funnel/update/route';
import { jsonRequest, responseText } from '../helpers/request';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/libs/prismadb', () => ({
  default: {
    group: {
      findFirst: vi.fn(),
    },
    funnel: {
      updateMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

const URL = 'http://localhost/api/group/funnel/update';
const MEMBERS = ['member-a', 'member-b'];

describe('POST /api/group/funnel/update (P0-2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'head-1' },
    } as never);
    vi.mocked(prisma.group.findFirst).mockResolvedValue({
      funnel: true,
      members: MEMBERS,
    } as never);
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await POST(
      jsonRequest(URL, { funnelId: 'f1', field: 'status', value: 'Hot' })
    );

    expect(response.status).toBe(401);
  });

  it('returns 403 when funnel owner is outside group members', async () => {
    vi.mocked(prisma.funnel.updateMany).mockResolvedValue({ count: 0 });

    const response = await POST(
      jsonRequest(URL, { funnelId: 'outside-funnel', field: 'status', value: 'Hot' })
    );

    expect(response.status).toBe(403);
    expect(await responseText(response)).toBe('Not found or forbidden.');
    expect(prisma.funnel.updateMany).toHaveBeenCalledWith({
      where: {
        funnelId: 'outside-funnel',
        staffsId: { in: MEMBERS },
      },
      data: { status: 'Hot' },
    });
    expect(prisma.funnel.findUnique).not.toHaveBeenCalled();
  });

  it('updates funnel when owner is in group members', async () => {
    vi.mocked(prisma.funnel.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.funnel.findUnique).mockResolvedValue({
      funnelId: 'team-funnel',
      status: 'Hot',
    } as never);

    const response = await POST(
      jsonRequest(URL, { funnelId: 'team-funnel', field: 'status', value: 'Hot' })
    );

    expect(response.status).toBe(200);
    expect(prisma.funnel.updateMany).toHaveBeenCalledWith({
      where: {
        funnelId: 'team-funnel',
        staffsId: { in: MEMBERS },
      },
      data: { status: 'Hot' },
    });
    await expect(response.json()).resolves.toEqual({
      funnelId: 'team-funnel',
      status: 'Hot',
    });
  });
});
