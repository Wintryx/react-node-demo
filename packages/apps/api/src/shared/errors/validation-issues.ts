import { ValidationError } from 'class-validator';

import { ApiValidationIssue } from './api-error.types';

interface ValidationErrorDetails {
  messages: string[];
  issues: ApiValidationIssue[];
}

const toFieldPath = (parentPath: string, property: string): string =>
  parentPath.length > 0 ? `${parentPath}.${property}` : property;

const collectValidationErrors = (
  validationErrors: ValidationError[],
  parentPath = '',
): ValidationErrorDetails => {
  const messages: string[] = [];
  const issues: ApiValidationIssue[] = [];

  for (const validationError of validationErrors) {
    const field = toFieldPath(parentPath, validationError.property);
    if (validationError.constraints) {
      for (const [rule, message] of Object.entries(validationError.constraints)) {
        messages.push(message);
        issues.push({
          field,
          rule,
          message,
        });
      }
    }

    if (validationError.children && validationError.children.length > 0) {
      const nested = collectValidationErrors(validationError.children, field);
      messages.push(...nested.messages);
      issues.push(...nested.issues);
    }
  }

  return { messages, issues };
};

export const toValidationErrorDetails = (
  validationErrors: ValidationError[],
): ValidationErrorDetails => collectValidationErrors(validationErrors);
