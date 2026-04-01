import { ValidationError } from 'class-validator';

import { toValidationErrorDetails } from './validation-issues';

const createValidationError = (input: {
  property: string;
  constraints?: Record<string, string>;
  children?: ValidationError[];
}): ValidationError =>
  ({
    property: input.property,
    constraints: input.constraints,
    children: input.children ?? [],
  }) as ValidationError;

describe('toValidationErrorDetails', () => {
  it('maps flat validation constraints to messages and issues', () => {
    const details = toValidationErrorDetails([
      createValidationError({
        property: 'email',
        constraints: {
          isEmail: 'email must be an email',
        },
      }),
    ]);

    expect(details.messages).toEqual(['email must be an email']);
    expect(details.issues).toEqual([
      {
        field: 'email',
        rule: 'isEmail',
        message: 'email must be an email',
      },
    ]);
  });

  it('maps nested validation errors with dot-path field names', () => {
    const details = toValidationErrorDetails([
      createValidationError({
        property: 'subtasks',
        children: [
          createValidationError({
            property: '0',
            children: [
              createValidationError({
                property: 'title',
                constraints: {
                  isNotEmpty: 'title should not be empty',
                },
              }),
            ],
          }),
        ],
      }),
    ]);

    expect(details.messages).toEqual(['title should not be empty']);
    expect(details.issues).toEqual([
      {
        field: 'subtasks.0.title',
        rule: 'isNotEmpty',
        message: 'title should not be empty',
      },
    ]);
  });
});
