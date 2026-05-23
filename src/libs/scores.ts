import { Prisma } from '@prisma/client';
import prisma from './prismadb';

export type DailyScoreRow = {
  id: string;
  name: string;
  date: Date;
  score: number;
};

export type MonthlyStaffScore = {
  month: string;
  staffsId: string;
  sumScore: number;
};

export type MonthlyUserScore = {
  month: string;
  scoreRaw: number;
};

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 0);
  return d;
}

/** Apply one daily score to every activity for each staff/day implied by activityIds. */
export async function applyScoreToStaffDays(
  activityIds: string[],
  data: {
    score: number;
    notification: string | null;
    checkedBy: string;
  }
): Promise<{ count: number }> {
  const activities = await prisma.activity.findMany({
    where: { activityId: { in: activityIds } },
    select: { staffsId: true, date: true },
  });

  if (activities.length === 0) {
    return { count: 0 };
  }

  const dayKeys = new Map<string, { staffsId: string; date: Date }>();
  for (const activity of activities) {
    const day = startOfDay(activity.date);
    const key = `${activity.staffsId}:${day.toISOString().slice(0, 10)}`;
    if (!dayKeys.has(key)) {
      dayKeys.set(key, { staffsId: activity.staffsId, date: day });
    }
  }

  let totalCount = 0;
  for (const { staffsId, date } of Array.from(dayKeys.values())) {
    const result = await prisma.activity.updateMany({
      where: {
        staffsId,
        date: { gte: date, lte: endOfDay(date) },
      },
      data: {
        score: data.score,
        notification: data.notification,
        checked: true,
        notificationChecked: false,
        checkedBy: data.checkedBy,
      },
    });
    totalCount += result.count;
  }

  return { count: totalCount };
}

/** MAX(score) per staff per calendar day, for score report pivots. */
export async function getDailyMaxScoreRows(params: {
  start: Date;
  end: Date;
  staffsIds?: string[];
  activeStaffOnly?: boolean;
}): Promise<DailyScoreRow[]> {
  const { start, end, staffsIds, activeStaffOnly = false } = params;

  if (staffsIds && staffsIds.length > 0) {
    const rows: Array<{
      id: string;
      name: string;
      date: Date;
      score: bigint | number | null;
    }> = activeStaffOnly
      ? await prisma.$queryRaw`
          SELECT
            a.staffsId AS id,
            s.name AS name,
            DATE(a.date) AS date,
            MAX(a.score) AS score
          FROM activity a
          JOIN staffs s ON a.staffsId = s.id
          WHERE a.date >= ${start}
            AND a.date <= ${end}
            AND s.leaveDate IS NULL
            AND a.staffsId IN (${Prisma.join(staffsIds)})
          GROUP BY DATE(a.date), a.staffsId, s.name
          ORDER BY date ASC
        `
      : await prisma.$queryRaw`
          SELECT
            a.staffsId AS id,
            s.name AS name,
            DATE(a.date) AS date,
            MAX(a.score) AS score
          FROM activity a
          JOIN staffs s ON a.staffsId = s.id
          WHERE a.date >= ${start}
            AND a.date <= ${end}
            AND a.staffsId IN (${Prisma.join(staffsIds)})
          GROUP BY DATE(a.date), a.staffsId, s.name
          ORDER BY date ASC
        `;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      date: new Date(row.date),
      score: row.score == null ? 0 : Number(row.score),
    }));
  }

  if (activeStaffOnly) {
    const rows: Array<{
      id: string;
      name: string;
      date: Date;
      score: bigint | number | null;
    }> = await prisma.$queryRaw`
      SELECT
        a.staffsId AS id,
        s.name AS name,
        DATE(a.date) AS date,
        MAX(a.score) AS score
      FROM activity a
      JOIN staffs s ON a.staffsId = s.id
      WHERE a.date >= ${start}
        AND a.date <= ${end}
        AND s.leaveDate IS NULL
      GROUP BY DATE(a.date), a.staffsId, s.name
      ORDER BY date ASC
    `;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      date: new Date(row.date),
      score: row.score == null ? 0 : Number(row.score),
    }));
  }

  const rows: Array<{
    id: string;
    name: string;
    date: Date;
    score: bigint | number | null;
  }> = await prisma.$queryRaw`
    SELECT
      a.staffsId AS id,
      s.name AS name,
      DATE(a.date) AS date,
      MAX(a.score) AS score
    FROM activity a
    JOIN staffs s ON a.staffsId = s.id
    WHERE a.date >= ${start}
      AND a.date <= ${end}
    GROUP BY DATE(a.date), a.staffsId, s.name
    ORDER BY date ASC
  `;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    date: new Date(row.date),
    score: row.score == null ? 0 : Number(row.score),
  }));
}

/** SUM of daily MAX scores per month, per staff (team performance). */
export async function getMonthlyScoresByStaff(
  start: Date,
  end: Date
): Promise<MonthlyStaffScore[]> {
  const rows: Array<{
    month: string;
    staffsId: string;
    sumScore: bigint | number | null;
  }> = await prisma.$queryRaw`
    SELECT
      DATE_FORMAT(sub.date, '%Y-%m') AS month,
      sub.staffsId,
      SUM(sub.score) AS sumScore
    FROM (
      SELECT
        DATE(a.date) AS date,
        a.staffsId,
        MAX(a.score) AS score
      FROM activity a
      WHERE a.date >= ${start} AND a.date <= ${end}
      GROUP BY DATE(a.date), a.staffsId
    ) AS sub
    GROUP BY month, sub.staffsId
    ORDER BY month ASC
  `;

  return rows.map((row) => ({
    month: row.month,
    staffsId: row.staffsId,
    sumScore: row.sumScore == null ? 0 : Number(row.sumScore),
  }));
}

/** SUM of daily MAX scores per month for one staff member. */
export async function getMonthlyScoresForStaff(
  start: Date,
  end: Date,
  staffsId: string
): Promise<MonthlyUserScore[]> {
  const rows: Array<{
    month: string;
    scoreRaw: bigint | number | null;
  }> = await prisma.$queryRaw`
    SELECT
      DATE_FORMAT(sub.date, '%Y-%m') AS month,
      SUM(sub.score) AS scoreRaw
    FROM (
      SELECT
        DATE(a.date) AS date,
        MAX(a.score) AS score
      FROM activity a
      WHERE a.date >= ${start}
        AND a.date <= ${end}
        AND a.staffsId = ${staffsId}
      GROUP BY DATE(a.date)
    ) AS sub
    GROUP BY month
    ORDER BY month ASC
  `;

  return rows.map((row) => ({
    month: row.month,
    scoreRaw: row.scoreRaw == null ? 0 : Number(row.scoreRaw),
  }));
}
