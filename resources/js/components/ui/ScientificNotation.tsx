import React from 'react';

interface ScientificNotationProps {
  value?: number | string | null;
  decimals?: number;
  fallback?: string;
  useSuperscript?: boolean;
  zeroDisplayMode?: 'lt1' | 'lt1Power';
}

const ScientificNotation: React.FC<ScientificNotationProps> = ({
  value,
  decimals = 2,
  fallback = '-',
  useSuperscript = false,
  zeroDisplayMode = 'lt1',
}) => {
  // 🔥 Validación explícita de null/undefined/vacío
  if (value === null || value === undefined || value === '') {
    return <span>{fallback}</span>;
  }

  const num = Number(value);

  if (isNaN(num)) {
    return <span>{fallback}</span>;
  }

  // Caso especial: cero
  if (num === 0) {
    if (zeroDisplayMode === 'lt1') {
      return <span>&lt;1</span>;
    } else {
      // lt1Power
      if (useSuperscript) {
        return <span>&lt;1x10<sup>1</sup></span>;
      } else {
        return <span>&lt;1x10^1</span>;
      }
    }
  }

  const absNum = Math.abs(num);

  if (absNum >= 1_000_000) {
    return <span>MNPC</span>;
  }

  const sign = num < 0 ? '-' : '';
  const exponent = Math.floor(Math.log10(absNum));
  const coefficient = absNum / Math.pow(10, exponent);
  const roundedCoeff = coefficient.toFixed(decimals);
  const cleanCoeff = roundedCoeff.replace(/\.?0+$/, '');

  if (useSuperscript) {
    const exponentStr = exponent.toString();
    return (
      <span>
        {sign}{cleanCoeff}x10<sup>{exponentStr}</sup>
      </span>
    );
  } else {
    return (
      <span>
        {sign}{cleanCoeff}x10^{exponent}
      </span>
    );
  }
};

export default ScientificNotation;
