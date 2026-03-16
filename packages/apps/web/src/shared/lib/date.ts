const pad = (value: number): string => value.toString().padStart(2, '0');

export const formatDateOnly = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseDateOnly = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

export const toDateOnly = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  return formatDateOnly(new Date(value));
};

export const toApiDateTime = (value: string): string => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)).toISOString();
};
