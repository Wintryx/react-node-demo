import { Employee } from '../../shared/api/types';

const generatedSuffixPattern =
  /(?:[-_\s]+)(?:[a-f0-9]{8,}|[a-z0-9]{12,}|[a-f0-9]{4}(?:-[a-f0-9]{4}){1,})$/i;

const hashLikeTokenPattern =
  /^(?:[a-f0-9]{8,}|[a-z0-9]{12,}|[a-f0-9]{4}(?:-[a-f0-9]{4}){1,})$/i;

const normalizeNamePart = (value: string): string => {
  const normalized = value.trim().replace(generatedSuffixPattern, '').trim();
  if (hashLikeTokenPattern.test(normalized)) {
    return '';
  }

  return normalized;
};

const fallbackNameFromEmail = (email: string): string =>
  email
    .split('@')[0]
    ?.replace(/[._-]+/g, ' ')
    .trim() ?? '';

export const getEmployeeDisplayName = (employee: Employee): string => {
  const firstName = normalizeNamePart(employee.firstName);
  const lastName = normalizeNamePart(employee.lastName);
  const fullName = `${firstName} ${lastName}`.replace(/\s+/g, ' ').trim();

  if (fullName.length > 0) {
    return fullName;
  }

  const fallback = fallbackNameFromEmail(employee.email);
  return fallback.length > 0 ? fallback : 'Mitarbeitende Person';
};
