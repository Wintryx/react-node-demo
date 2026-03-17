export const isProductionEnvironment = (nodeEnv: string | undefined): boolean =>
  (nodeEnv ?? '').trim().toLowerCase() === 'production';

export const shouldEnableSwagger = (nodeEnv: string | undefined): boolean =>
  !isProductionEnvironment(nodeEnv);
