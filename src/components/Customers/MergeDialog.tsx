'use client';

type MergeRow = {
  personId: string;
  companyId: string | null;
  personName: string;
  companyName: string | undefined;
};

type MergeDialogProps = {
  type: 'contacts' | 'companies';
  rows: MergeRow[];
  survivorId: string;
  onSurvivorChange: (personId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

function rowOptionLabel(type: 'contacts' | 'companies', row: MergeRow) {
  if (type === 'companies') {
    const company = row.companyName ?? 'Unknown company';
    return row.personName ? `${company} — ${row.personName}` : company;
  }
  const contact = row.personName ?? 'Unknown contact';
  return row.companyName ? `${contact} — ${row.companyName}` : contact;
}

export default function CustomerMergeDialog({
  type,
  rows,
  survivorId,
  onSurvivorChange,
  onConfirm,
  onCancel,
  isSubmitting,
}: MergeDialogProps) {
  const survivor = rows.find((row) => row.personId === survivorId);
  const others = rows.filter((row) => row.personId !== survivorId);
  const uniqueCompanyIds = new Set(
    rows.map((row) => row.companyId).filter(Boolean)
  );
  const sameCompanyOnly =
    type === 'companies' && uniqueCompanyIds.size <= 1;

  const entityNoun = type === 'contacts' ? 'contact' : 'company';
  const entityNounPlural = type === 'contacts' ? 'contacts' : 'companies';

  const survivorPrimary =
    type === 'companies'
      ? survivor?.companyName ?? survivor?.personName ?? '—'
      : survivor?.personName ?? '—';

  const survivorSecondary =
    type === 'companies' ? survivor?.personName : survivor?.companyName;

  const title =
    type === 'contacts' ? 'Merge contacts' : 'Merge companies';

  const description =
    type === 'contacts'
      ? 'Pick the contact record that stays. History from the others moves there; the other contact rows are deleted.'
      : 'Pick the company record that stays. Contacts and history from the others move there; duplicate company rows are deleted.';

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="text-title-md font-semibold text-black dark:text-white">
          {title}
        </h3>
        <p className="mt-3 text-sm text-body dark:text-bodydark">
          {description}
        </p>

        {sameCompanyOnly ? (
          <p className="mt-4 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
            These contacts already belong to the same company
            {survivor?.companyName ? ` (${survivor.companyName})` : ''}.
            Use <strong>Merge Contacts</strong> instead if you want to combine
            duplicate people.
          </p>
        ) : (
          <>
            <label
              htmlFor="merge-survivor"
              className="mt-5 block text-sm font-semibold text-black dark:text-white"
            >
              Master {entityNoun} — everything merges into this one
            </label>
            <select
              id="merge-survivor"
              value={survivorId}
              onChange={(event) => onSurvivorChange(event.target.value)}
              className="mt-2 w-full rounded-sm border border-stroke bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
            >
              {rows.map((row) => (
                <option key={row.personId} value={row.personId}>
                  {rowOptionLabel(type, row)}
                </option>
              ))}
            </select>

            {survivor ? (
              <div className="mt-4 rounded-sm border-2 border-primary bg-primary/5 px-4 py-4 dark:bg-primary/10">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Master record — kept after merge
                </p>
                <p className="mt-2 text-lg font-semibold text-black dark:text-white">
                  {survivorPrimary}
                </p>
                {survivorSecondary ? (
                  <p className="mt-1 text-sm text-body dark:text-bodydark">
                    {type === 'companies' ? 'Contact' : 'Company'}:{' '}
                    {survivorSecondary}
                  </p>
                ) : null}
                <p className="mt-3 text-sm text-body dark:text-bodydark">
                  All {others.length} other selected {others.length === 1 ? entityNoun : entityNounPlural}{' '}
                  will be merged into this record and removed from the grid.
                </p>
              </div>
            ) : null}

            {others.length > 0 ? (
              <div className="mt-4">
                <p className="text-sm font-semibold text-black dark:text-white">
                  Merged into{' '}
                  <span className="text-primary">{survivorPrimary}</span> and
                  deleted
                </p>
                <ul className="mt-2 space-y-2">
                  {others.map((row) => (
                    <li
                      key={row.personId}
                      className="flex items-center gap-2 rounded-sm border border-stroke bg-gray-2 px-3 py-2 text-sm dark:border-strokedark dark:bg-meta-4"
                    >
                      <span
                        className="shrink-0 font-medium text-primary"
                        aria-hidden="true"
                      >
                        →
                      </span>
                      <span className="text-body dark:text-bodydark">
                        {rowOptionLabel(type, row)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-sm border border-stroke px-4 py-2 text-sm font-medium text-black dark:border-strokedark dark:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting || sameCompanyOnly || !survivorId}
            className="rounded-sm bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? 'Merging…'
              : survivorPrimary
                ? `Merge into “${survivorPrimary}”`
                : 'Confirm merge'}
          </button>
        </div>
      </div>
    </div>
  );
}
