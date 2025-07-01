import { DxpContext, EntityConfig } from '@dxp/iam-lib';

export const getEntityId = (entity: string, ctx: DxpContext): string => {
  const iamEntityConfig = JSON.parse(
    ctx.portalContext.iamEntityConfig,
  ) as Record<string, EntityConfig>;

  if (!ctx.portalContext.iamEntityConfig) {
    throw new Error(`Missing iam entity config property.`);
  }

  if (!iamEntityConfig[entity]) {
    throw new Error(`Unknown entity type: ${entity}.`);
  }

  const contextProperty = iamEntityConfig[entity].contextProperty;
  return ctx[contextProperty];
};
