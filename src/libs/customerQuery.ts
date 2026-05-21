import prisma from '@/libs/prismadb';
import { Prisma } from '@prisma/client';

export type CustomerGridRow = {
  companyId: string | null;
  companyName: string | undefined;
  personId: string;
  personName: string;
  emailId: string;
  phoneNo: string | null;
  staffs: string[];
  numberOfBranch: number | null | undefined;
  totalITUsers: number | null | undefined;
  firewallModelNo: string | null | undefined;
  firewallAMCDueDate: Date | null | undefined;
  antiVirusOem: string | null | undefined;
  renewalDueDate: Date | null | undefined;
  L3SwitchModel: string | null | undefined;
  L3AMCDueDate: Date | null | undefined;
  L2SwitchModel: string | null | undefined;
  L2AMCDueDate: Date | null | undefined;
  wifiModel: string | null | undefined;
  wifiAMCDueDate: Date | null | undefined;
  VCOEM: string | null | undefined;
  VCAMCDueDate: Date | null | undefined;
  epbxModel: string | null | undefined;
  epbxAMCDute: Date | null | undefined;
  location: string | null | undefined;
  state: string | null | undefined;
};

type PersonWithRelations = Prisma.PersonGetPayload<{
  include: {
    company: true;
    staffs: {
      include: {
        staff: true;
      };
    };
  };
}>;

async function fetchPersonRows(
  where: { AND: Record<string, unknown>[] },
  sortModel?: Record<string, unknown>,
  startRow?: number,
  endRow?: number
): Promise<PersonWithRelations[]> {
  const newSort = buildCustomerSort(sortModel);

  return prisma.person.findMany({
    where,
    orderBy: newSort,
    ...(startRow !== undefined && endRow !== undefined
      ? { skip: startRow, take: endRow - startRow }
      : {}),
    include: {
      company: true,
      staffs: {
        include: {
          staff: true,
        },
      },
    },
  });
}

function buildCustomerSort(
  sortModel?: Record<string, unknown>
): Prisma.PersonOrderByWithRelationInput | Prisma.PersonOrderByWithRelationInput[] {
  if (!sortModel || Object.keys(sortModel).length === 0) {
    return [
      { company: { companyName: 'asc' } },
      { personName: 'asc' },
    ];
  }

  if (sortModel['Customer']) {
    return {
      company: {
        companyName: (
          sortModel['Customer'] as { companyName: 'asc' | 'desc' }
        ).companyName,
      },
    };
  }

  if (sortModel['person']) {
    return {
      personName: (sortModel['person'] as { personName: 'asc' | 'desc' })
        .personName,
    };
  }

  if (['staffs', 'phoneNo', 'emailId'].includes(Object.keys(sortModel)[0])) {
    return {
      company: {
        companyName: 'asc' as const,
      },
    };
  }

  return { company: sortModel as Prisma.CustomerOrderByWithRelationInput };
}

export async function buildCustomerWhere(
  filterModel: Record<string, unknown> = {}
): Promise<{ AND: Record<string, unknown>[] }> {
  const newFilter: Record<string, unknown>[] = [
    filterModel.personName ? { personName: filterModel.personName } : {},
    filterModel.phoneNo ? { phoneNo: filterModel.phoneNo } : {},
    filterModel.emailId ? { emailId: filterModel.emailId } : {},
    filterModel.companyName
      ? { company: { companyName: filterModel.companyName } }
      : {},
  ];

  for (const [key, value] of Object.entries(filterModel)) {
    if (
      !['personName', 'phoneNo', 'emailId', 'companyName', 'employee'].includes(
        key
      )
    ) {
      newFilter.push({
        company: {
          [key]: value,
        },
      });
    }
  }

  if (filterModel.employee) {
    const staff = await prisma.staffs.findFirst({
      where: filterModel.employee as Record<string, unknown>,
    });

    if (staff) {
      newFilter.push({
        staffs: {
          some: {
            staffId: staff.id,
          },
        },
      });
    } else {
      newFilter.push({ personId: { in: [] } });
    }
  }

  return { AND: newFilter };
}

export function mapPersonToGridRow(person: PersonWithRelations): CustomerGridRow {
  return {
    companyId: person.companyId,
    companyName: person.company?.companyName,
    personId: person.personId,
    personName: person.personName,
    emailId: person.emailId,
    phoneNo: person.phoneNo,
    staffs: person.staffs.map((ps) => ps.staff.name),
    numberOfBranch: person.company?.numberOfBranch,
    totalITUsers: person.company?.totalITUsers,
    firewallModelNo: person.company?.firewallModelNo,
    firewallAMCDueDate: person.company?.firewallAMCDueDate,
    antiVirusOem: person.company?.antiVirusOem,
    renewalDueDate: person.company?.renewalDueDate,
    L3SwitchModel: person.company?.L3SwitchModel,
    L3AMCDueDate: person.company?.L3AMCDueDate,
    L2SwitchModel: person.company?.L2SwitchModel,
    L2AMCDueDate: person.company?.L2AMCDueDate,
    wifiModel: person.company?.wifiModel,
    wifiAMCDueDate: person.company?.wifiAMCDueDate,
    VCOEM: person.company?.VCOEM,
    VCAMCDueDate: person.company?.VCAMCDueDate,
    epbxModel: person.company?.epbxModel,
    epbxAMCDute: person.company?.epbxAMCDute,
    location: person.company?.location,
    state: person.company?.state,
  };
}

export async function queryCustomerGridRows(
  filterModel: Record<string, unknown>,
  sortModel?: Record<string, unknown>,
  startRow?: number,
  endRow?: number
): Promise<CustomerGridRow[]> {
  const where = await buildCustomerWhere(filterModel);
  const persons = await fetchPersonRows(where, sortModel, startRow, endRow);
  return persons.map(mapPersonToGridRow);
}

export async function queryCustomerCounts(filterModel: Record<string, unknown>) {
  const where = await buildCustomerWhere(filterModel);

  const [totalContacts, companyGroups] = await Promise.all([
    prisma.person.count({ where }),
    prisma.person.groupBy({
      by: ['companyId'],
      where: {
        AND: [...where.AND, { companyId: { not: null } }],
      },
    }),
  ]);

  return {
    count: companyGroups.length,
    contact: totalContacts,
  };
}
