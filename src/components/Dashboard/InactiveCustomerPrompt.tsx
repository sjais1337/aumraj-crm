'use client';

import { useState } from 'react';

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

type InactiveCustomerPromptProps = {
  customers: ReengageCustomer[];
};

export default function InactiveCustomerPrompt({
  customers,
}: InactiveCustomerPromptProps) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  if (!customers.length) {
    return null;
  }

  const toggleReveal = (customerId: string) => {
    setRevealed((prev) => ({
      ...prev,
      [customerId]: !prev[customerId],
    }));
  };

  return (
    <div className="col-span-1 md:col-span-12 rounded-sm border border-amber-400 border-l-4 bg-amber-50 px-4 py-3 shadow-default dark:border-amber-600 dark:border-l-amber-500 dark:bg-amber-950/30 sm:px-5 sm:py-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
        <h4 className="text-base font-bold text-amber-950 dark:text-amber-100">
          Re-engage today
        </h4>
        <p className="text-sm text-amber-900/80 dark:text-amber-200/80">
          These accounts haven&apos;t heard from us recently, reach out today.
        </p>
      </div>

      <ul className="mt-3 flex flex-col gap-3 md:flex-row md:gap-4">
        {customers.map((customer) => {
          const isRevealed = revealed[customer.customerId];

          return (
            <li
              key={customer.customerId}
              className="min-w-0 flex-1 rounded-sm border border-amber-200/80 bg-white/70 px-3.5 py-3 dark:border-amber-800 dark:bg-boxdark/60 sm:px-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-black dark:text-white">
                    {customer.companyName}
                  </p>
                  <p className="mt-0.5 text-sm text-body dark:text-bodydark">
                    {customer.promptLine}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleReveal(customer.customerId)}
                  className="shrink-0 self-start rounded-sm border border-amber-500 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-500 dark:text-amber-100 dark:hover:bg-amber-900/40"
                >
                  {isRevealed ? 'Hide contact' : 'Reveal contact'}
                </button>
              </div>

              {isRevealed ? (
                customer.contact ? (
                  <div className="mt-2.5 border-t border-amber-200 pt-2.5 text-sm dark:border-amber-800">
                    <p className="font-medium text-black dark:text-white">
                      {customer.contact.personName}
                    </p>
                    <div className="mt-1 flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:gap-x-3">
                      {customer.contact.phoneNo ? (
                        <a
                          href={`tel:${customer.contact.phoneNo}`}
                          className="text-primary hover:underline"
                        >
                          {customer.contact.phoneNo}
                        </a>
                      ) : null}
                      {customer.contact.emailId ? (
                        <a
                          href={`mailto:${customer.contact.emailId}`}
                          className="break-all text-primary hover:underline"
                        >
                          {customer.contact.emailId}
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <p className="mt-2.5 border-t border-amber-200 pt-2.5 text-sm text-body dark:border-amber-800 dark:text-bodydark">
                    No contact on file.
                  </p>
                )
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
