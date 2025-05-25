// src/utils/formatters.ts
export const formatCurrency = (
  value: string | number | null | undefined
): string => {
  if (value == null) return 'R$ 0,00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'N/A'; // Ou 'R$ 0,00' se preferir
  return numValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
