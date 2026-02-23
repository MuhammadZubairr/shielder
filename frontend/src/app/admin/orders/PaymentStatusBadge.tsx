'use client';

import React from 'react';
import { CreditCard, CheckCircle2, AlertCircle, RefreshCw, XCircle, type LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { PaymentStatus } from './types';

interface Props {
  status: PaymentStatus | string;
  size?: 'sm' | 'md';
}

const PAY_CONFIG: Record<
  string,
  { labelKey: string; classes: string; Icon: LucideIcon }
> = {
  UNPAID:   { labelKey: 'payUnpaid',   classes: 'bg-red-50 text-red-700 border-red-200',       Icon: AlertCircle  },
  PENDING:  { labelKey: 'payPending',  classes: 'bg-amber-50 text-amber-700 border-amber-200', Icon: CreditCard   },
  PAID:     { labelKey: 'payPaid',     classes: 'bg-green-50 text-green-700 border-green-200', Icon: CheckCircle2 },
  PARTIAL:  { labelKey: 'payPartial',  classes: 'bg-sky-50 text-sky-700 border-sky-200',       Icon: CreditCard   },
  REFUNDED: { labelKey: 'payRefunded', classes: 'bg-gray-100 text-gray-600 border-gray-200',   Icon: RefreshCw    },
  FAILED:   { labelKey: 'payFailed',   classes: 'bg-red-100 text-red-800 border-red-300',      Icon: XCircle      },
};

export default function PaymentStatusBadge({ status, size = 'md' }: Props) {
  const { t } = useLanguage();
  const config = PAY_CONFIG[status] ?? {
    labelKey: '',
    classes: 'bg-gray-50 text-gray-600 border-gray-200',
    Icon: CreditCard,
  };

  const { Icon } = config;
  const label = config.labelKey ? t(config.labelKey) : status;
  const textSize = size === 'sm' ? 'text-[9px]' : 'text-[10px]';
  const px = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 font-black uppercase tracking-wider border rounded-full whitespace-nowrap ${config.classes} ${textSize} ${px}`}
    >
      <Icon size={size === 'sm' ? 11 : 13} />
      {label}
    </span>
  );
}
