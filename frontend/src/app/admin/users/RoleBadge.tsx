'use client';

import React from 'react';
import { Shield, User, Briefcase, type LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { UserRole } from './types';

interface Props {
  role: UserRole | string;
  size?: 'sm' | 'md';
}

const ROLE_CONFIG: Record<
  string,
  { labelKey: string; classes: string; Icon: LucideIcon }
> = {
  USER:        { labelKey: 'roleCustomer', classes: 'bg-sky-50 text-sky-700 border-sky-200',         Icon: User      },
  STAFF:       { labelKey: 'roleStaff',    classes: 'bg-violet-50 text-violet-700 border-violet-200', Icon: Briefcase },
  ADMIN:       { labelKey: 'roleAdmin',    classes: 'bg-amber-50 text-amber-700 border-amber-200',    Icon: Shield    },
  SUPER_ADMIN: { labelKey: 'roleSuperAdmin', classes: 'bg-red-50 text-red-700 border-red-200',        Icon: Shield    },
};

export default function RoleBadge({ role, size = 'md' }: Props) {
  const { t } = useLanguage();
  const config = ROLE_CONFIG[role] ?? {
    labelKey: '',
    classes: 'bg-gray-50 text-gray-600 border-gray-200',
    Icon: User,
  };

  const { Icon } = config;
  const label = config.labelKey ? t(config.labelKey) : role;
  const iconSize = size === 'sm' ? 11 : 13;
  const textSize = size === 'sm' ? 'text-[9px]' : 'text-[10px]';
  const px = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 font-black uppercase tracking-wider border rounded-full whitespace-nowrap ${config.classes} ${textSize} ${px}`}
    >
      <Icon size={iconSize} />
      {label}
    </span>
  );
}
