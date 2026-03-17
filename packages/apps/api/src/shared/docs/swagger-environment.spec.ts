import { isProductionEnvironment, shouldEnableSwagger } from './swagger-environment';

describe('swagger-environment', () => {
  it('disables swagger in production', () => {
    expect(shouldEnableSwagger('production')).toBe(false);
  });

  it('treats mixed-case production values as production', () => {
    expect(isProductionEnvironment('PrOdUcTiOn')).toBe(true);
    expect(shouldEnableSwagger('PrOdUcTiOn')).toBe(false);
  });

  it('enables swagger in non-production environments', () => {
    expect(shouldEnableSwagger(undefined)).toBe(true);
    expect(shouldEnableSwagger('development')).toBe(true);
    expect(shouldEnableSwagger('test')).toBe(true);
  });
});
