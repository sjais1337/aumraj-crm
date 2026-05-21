import { formatDate } from './consts';

export type ExportColumnFormat = 'text' | 'date' | 'number' | 'boolean';

export type ExportColumn = {
  header: string;
  getValue: (row: Record<string, unknown>) => unknown;
  format?: ExportColumnFormat;
};

function companyField(row: Record<string, unknown>, field: string): unknown {
  const company = row.company as Record<string, unknown> | undefined;
  return company?.[field] ?? '';
}

function formatCell(value: unknown, format: ExportColumnFormat = 'text'): string | number {
  if (value == null || value === '') {
    return '';
  }

  switch (format) {
    case 'date':
      return formatDate(value);
    case 'boolean':
      return value === true || value === 'true' ? 'Yes' : 'No';
    case 'number': {
      const num = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(num) ? num : '';
    }
    default:
      return String(value);
  }
}

export function rowsToExportSheet(
  rows: Record<string, unknown>[],
  columns: ExportColumn[]
): Record<string, string | number>[] {
  return rows.map((row) => {
    const out: Record<string, string | number> = {};
    for (const col of columns) {
      out[col.header] = formatCell(col.getValue(row), col.format);
    }
    return out;
  });
}

const FUNNEL_COLUMNS: ExportColumn[] = [
  { header: 'Employee', getValue: (r) => r.staffsId },
  { header: 'Company', getValue: (r) => r.companyName },
  { header: 'Type', getValue: (r) => r.type },
  { header: 'Status', getValue: (r) => r.status },
  { header: 'Closure Date', getValue: (r) => r.closureDate, format: 'date' },
  { header: 'Top Line', getValue: (r) => r.topLine, format: 'number' },
  { header: 'Bottom Line', getValue: (r) => r.bottomLine, format: 'number' },
  { header: 'Opportunity', getValue: (r) => r.opportunity },
  { header: 'OEM', getValue: (r) => r.oem },
  { header: 'Description', getValue: (r) => r.description },
  { header: 'Add Date', getValue: (r) => r.date, format: 'date' },
  { header: 'Contact Person', getValue: (r) => r.personName },
  { header: 'Phone No.', getValue: (r) => r.phoneNo },
  { header: 'Email', getValue: (r) => r.emailId },
];

const AMC_COLUMNS: ExportColumn[] = [
  { header: 'Employee', getValue: (r) => r.staffsId },
  { header: 'Company', getValue: (r) => r.companyName },
  { header: 'OEM', getValue: (r) => r.oem },
  { header: 'Start Date', getValue: (r) => r.slaStartDate, format: 'date' },
  { header: 'End Date', getValue: (r) => r.slaEndDate, format: 'date' },
  { header: 'Serial No', getValue: (r) => r.serialNo },
  { header: 'Product Description', getValue: (r) => r.productDescription },
  { header: 'Contract ID', getValue: (r) => r.contractId },
  { header: 'SLA', getValue: (r) => r.sla },
  { header: 'Support Type', getValue: (r) => r.supportType },
  { header: 'Email ID', getValue: (r) => r.emailId },
  { header: 'Phone No.', getValue: (r) => r.phoneNo },
  { header: 'Archived', getValue: (r) => r.archived, format: 'boolean' },
];

const CUSTOMER_COLUMNS: ExportColumn[] = [
  { header: 'Company', getValue: (r) => companyField(r, 'companyName') },
  { header: 'Contact Name', getValue: (r) => r.personName },
  { header: 'Phone No.', getValue: (r) => r.phoneNo },
  { header: 'Email', getValue: (r) => r.emailId },
  { header: 'No. of Branches', getValue: (r) => companyField(r, 'numberOfBranch'), format: 'number' },
  { header: 'Total IT Users', getValue: (r) => companyField(r, 'totalITUsers'), format: 'number' },
  { header: 'Firewall Model No', getValue: (r) => companyField(r, 'firewallModelNo') },
  { header: 'Firewall AMC Date', getValue: (r) => companyField(r, 'firewallAMCDueDate'), format: 'date' },
  { header: 'Anti Virus OEM', getValue: (r) => companyField(r, 'antiVirusOem') },
  { header: 'Renewal Due Date', getValue: (r) => companyField(r, 'renewalDueDate'), format: 'date' },
  { header: 'L3 Switch Model', getValue: (r) => companyField(r, 'L3SwitchModel') },
  { header: 'L3 AMC Date', getValue: (r) => companyField(r, 'L3AMCDueDate'), format: 'date' },
  { header: 'L2 Switch Model', getValue: (r) => companyField(r, 'L2SwitchModel') },
  { header: 'L2 AMC Date', getValue: (r) => companyField(r, 'L2AMCDueDate'), format: 'date' },
  { header: 'Wi-Fi Model', getValue: (r) => companyField(r, 'wifiModel') },
  { header: 'Wi-Fi AMC Date', getValue: (r) => companyField(r, 'wifiAMCDueDate'), format: 'date' },
  { header: 'VC OEM', getValue: (r) => companyField(r, 'VCOEM') },
  { header: 'VC AMC Date', getValue: (r) => companyField(r, 'VCAMCDueDate'), format: 'date' },
  { header: 'EPBX Model', getValue: (r) => companyField(r, 'epbxModel') },
  { header: 'EPBX Date', getValue: (r) => companyField(r, 'epbxAMCDute'), format: 'date' },
  { header: 'Location', getValue: (r) => companyField(r, 'location') },
  { header: 'State', getValue: (r) => companyField(r, 'state') },
];

const EXPORT_COLUMNS: Record<string, ExportColumn[]> = {
  funnel: FUNNEL_COLUMNS,
  amc: AMC_COLUMNS,
  customers: CUSTOMER_COLUMNS,
};

export function formatExportData(
  parent: string,
  rows: Record<string, unknown>[]
): Record<string, string | number>[] {
  const columns = EXPORT_COLUMNS[parent];
  if (!columns) {
    return rows as Record<string, string | number>[];
  }
  return rowsToExportSheet(rows, columns);
}

export function exportSheetName(parent: string): string {
  switch (parent) {
    case 'funnel':
      return 'Funnel';
    case 'amc':
      return 'AMC';
    case 'customers':
      return 'Customers';
    default:
      return parent;
  }
}
