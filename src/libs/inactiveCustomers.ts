import prisma from '@/libs/prismadb';
import { formatCurrency } from '@/libs/consts';

export type ReengageCandidateRow = {
  customerId: string;
  companyName: string;
  lastTouch: Date;
  daysSinceTouch: number;
  wonTotal: number;
  totalITUsers: number | null;
  numberOfBranch: number | null;
  slaCount: number;
  hasActiveSla: number;
};

export type ReengageCustomer = {
  customerId: string;
  companyName: string;
  daysSinceTouch: number;
  lastTouchDate: string;
  promptLine: string;
  contact: {
    personName: string;
    phoneNo?: string;
    emailId?: string;
  } | null;
};

type PrimaryContact = {
  personName: string;
  phoneNo: string | null;
  emailId: string;
} | null;

const MIN_WEIGHT = 0.01;
const ACTIVE_SLA_PENALTY = 0.4;

/** Recency multiplier — recent contact lowers pick probability, does not exclude. */
export function recencyMultiplier(daysSinceTouch: number): number {
  if (daysSinceTouch <= 30) return 0.2;
  if (daysSinceTouch <= 60) return 0.5;
  if (daysSinceTouch <= 90) return 0.8;
  return 1.0;
}

/** Yield score from account value signals (org-wide). */
export function computeYieldScore(candidate: {
  wonTotal: number;
  totalITUsers: number | null;
  numberOfBranch: number | null;
  slaCount: number;
}): number {
  const won = Number(candidate.wonTotal) || 0;
  const users = candidate.totalITUsers ?? 0;
  const branches = candidate.numberOfBranch ?? 0;
  const slas = Number(candidate.slaCount) || 0;

  const wonComponent = won > 0 ? 1 + Math.log10(won + 1) * 8 : 1;
  const usersComponent = users * 0.15;
  const branchComponent = branches * 0.5;
  const slaComponent = slas * 1.5;

  return wonComponent + usersComponent + branchComponent + slaComponent;
}

export function computeSelectionWeight(candidate: {
  daysSinceTouch: number;
  wonTotal: number;
  totalITUsers: number | null;
  numberOfBranch: number | null;
  slaCount: number;
  hasActiveSla: number | boolean;
}): number {
  const yieldScore = computeYieldScore(candidate);
  const recency = recencyMultiplier(candidate.daysSinceTouch);
  const slaPenalty =
    candidate.hasActiveSla === true || candidate.hasActiveSla === 1
      ? ACTIVE_SLA_PENALTY
      : 1;

  return Math.max(MIN_WEIGHT, yieldScore * recency * slaPenalty);
}

export function formatPromptLine(candidate: {
  daysSinceTouch: number;
  wonTotal: number;
  totalITUsers: number | null;
  numberOfBranch: number | null;
}): string {
  const quiet = `${candidate.daysSinceTouch} days quiet`;
  const won = Number(candidate.wonTotal) || 0;

  if (won > 0) {
    return `${formatCurrency(won)} won · ${quiet}`;
  }
  if (candidate.totalITUsers && candidate.totalITUsers > 0) {
    return `${candidate.totalITUsers} IT users · ${quiet}`;
  }
  if (candidate.numberOfBranch && candidate.numberOfBranch > 0) {
    return `${candidate.numberOfBranch} branches · ${quiet}`;
  }
  return quiet;
}

export function weightedRandomSample<T>(
  items: T[],
  getWeight: (item: T) => number,
  count: number,
  random: () => number = Math.random
): T[] {
  const pool = [...items];
  const picked: T[] = [];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const weights = pool.map(getWeight);
    const total = weights.reduce((sum, w) => sum + w, 0);

    if (total <= 0) {
      break;
    }

    let roll = random() * total;
    let index = pool.length - 1;

    for (let j = 0; j < pool.length; j++) {
      roll -= weights[j];
      if (roll <= 0) {
        index = j;
        break;
      }
    }

    picked.push(pool[index]);
    pool.splice(index, 1);
  }

  return picked;
}

function normalizeCandidateRow(row: ReengageCandidateRow): ReengageCandidateRow {
  return {
    ...row,
    daysSinceTouch: Number(row.daysSinceTouch),
    wonTotal: Number(row.wonTotal),
    slaCount: Number(row.slaCount),
    hasActiveSla: Number(row.hasActiveSla),
    lastTouch: new Date(row.lastTouch),
  };
}

function rowToCustomer(
  row: ReengageCandidateRow,
  contact: PrimaryContact
): ReengageCustomer {
  const lastTouchDate = row.lastTouch.toISOString().split('T')[0];

  return {
    customerId: row.customerId,
    companyName: row.companyName,
    daysSinceTouch: Number(row.daysSinceTouch),
    lastTouchDate,
    promptLine: formatPromptLine(row),
    contact: contact
      ? {
          personName: contact.personName,
          phoneNo: contact.phoneNo ?? undefined,
          emailId: contact.emailId ?? undefined,
        }
      : null,
  };
}

async function getPrimaryContact(companyId: string): Promise<PrimaryContact> {
  const recentActivity = await prisma.activity.findFirst({
    where: { companyId, personId: { not: null } },
    orderBy: { date: 'desc' },
    select: {
      person: {
        select: { personName: true, phoneNo: true, emailId: true },
      },
    },
  });

  if (recentActivity?.person) {
    return recentActivity.person;
  }

  const recentFunnel = await prisma.funnel.findFirst({
    where: { companyId },
    orderBy: { date: 'desc' },
    select: {
      person: {
        select: { personName: true, phoneNo: true, emailId: true },
      },
    },
  });

  if (recentFunnel?.person) {
    return recentFunnel.person;
  }

  return prisma.person.findFirst({
    where: { companyId },
    select: { personName: true, phoneNo: true, emailId: true },
  });
}

export async function getReengageCandidates(): Promise<ReengageCandidateRow[]> {
  const rows = await prisma.$queryRaw<ReengageCandidateRow[]>`
    SELECT
      c.customerId,
      c.companyName,
      lt.lastTouch,
      DATEDIFF(CURDATE(), lt.lastTouch) AS daysSinceTouch,
      COALESCE(w.wonTotal, 0) AS wonTotal,
      c.totalITUsers,
      c.numberOfBranch,
      COALESCE(sla.slaCount, 0) AS slaCount,
      COALESCE(sla.hasActiveSla, 0) AS hasActiveSla
    FROM customer c
    INNER JOIN (
      SELECT
        companyId,
        MAX(d) AS lastTouch,
        MIN(d) AS firstTouch
      FROM (
        SELECT companyId, date AS d
        FROM activity
        WHERE companyId IS NOT NULL
          AND location IN ('Meeting', 'Telecalling')
        UNION ALL
        SELECT companyId, date AS d FROM funnel
        UNION ALL
        SELECT companyId, addDate AS d FROM support
        UNION ALL
        SELECT companyId, closeDate AS d FROM support
        UNION ALL
        SELECT companyId, slaStartDate AS d FROM sla
      ) touches
      GROUP BY companyId
    ) lt ON lt.companyId = c.customerId
    LEFT JOIN (
      SELECT companyId, SUM(topLine) AS wonTotal
      FROM funnel
      WHERE status = 'Won'
      GROUP BY companyId
    ) w ON w.companyId = c.customerId
    LEFT JOIN (
      SELECT
        companyId,
        COUNT(*) AS slaCount,
        MAX(
          CASE
            WHEN (archived IS NULL OR archived = false) AND slaEndDate >= CURDATE()
            THEN 1 ELSE 0
          END
        ) AS hasActiveSla
      FROM sla
      GROUP BY companyId
    ) sla ON sla.companyId = c.customerId
    WHERE lt.firstTouch < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  `;

  return rows.map(normalizeCandidateRow);
}

export async function pickReengageCustomers(count = 2): Promise<ReengageCustomer[]> {
  const candidates = await getReengageCandidates();

  if (candidates.length === 0) {
    return [];
  }

  const picked = weightedRandomSample(
    candidates,
    (c) => computeSelectionWeight(c),
    Math.min(count, candidates.length)
  );

  const contacts = await Promise.all(
    picked.map((row) => getPrimaryContact(row.customerId))
  );

  return picked.map((row, index) => rowToCustomer(row, contacts[index]));
}
