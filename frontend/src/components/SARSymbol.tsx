/**
 * CurrencySymbol (previously SARSymbol)
 * Renders the symbol for the configured system currency.
 * - SAR → official Saudi Riyal image asset
 * - USD → $   EUR → €   GBP → £   etc.
 * Reads the active currency from CurrencyContext so it updates
 * immediately when an admin changes the setting.
 */
'use client';

import { useCurrency } from '@/contexts/CurrencyContext';

const TEXT_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED',
  KWD: 'KD',
  QAR: 'QAR',
  BHD: 'BD',
  OMR: 'OMR',
};

export default function SARSymbol({
  className = '',
  size,
}: {
  className?: string;
  /** Pixel size — defaults to 1em so it scales with surrounding text */
  size?: number;
}) {
  const { currency } = useCurrency();

  const style = size
    ? { width: size, height: size }
    : { width: '1em', height: '1em' };

  if (currency === 'SAR') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/images/riyal-logo.png"
        alt="SAR"
        aria-label="Saudi Riyal"
        className={`inline-block align-middle ${className}`}
        style={style}
      />
    );
  }

  const symbol = TEXT_SYMBOLS[currency] ?? currency;
  return (
    <span
      className={`inline-block align-middle font-medium ${className}`}
      aria-label={currency}
      style={{ fontSize: size ? size : undefined }}
    >
      {symbol}
    </span>
  );
}

