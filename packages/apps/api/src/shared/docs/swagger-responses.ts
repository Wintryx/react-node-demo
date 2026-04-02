import { ApiBadRequestResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export const SWAGGER_UNAUTHORIZED_BEARER_DESCRIPTION = 'Missing or invalid bearer token.';
export const SWAGGER_VALIDATION_BAD_REQUEST_DESCRIPTION =
  'Validation failed for the request body.';

export const ApiBearerTokenUnauthorizedResponse = () =>
  ApiUnauthorizedResponse({
    description: SWAGGER_UNAUTHORIZED_BEARER_DESCRIPTION,
  });

export const ApiValidationBodyBadRequestResponse = () =>
  ApiBadRequestResponse({
    description: SWAGGER_VALIDATION_BAD_REQUEST_DESCRIPTION,
  });
