import { EntityConfig, NodeContext } from '@platform-mesh/iam-lib';

export const getEntityId = (entity: string, ctx: NodeContext): string => {
  const iamEntityConfig = JSON.parse(
    ctx.portalContext.iamEntityConfig,
  ) as Record<string, EntityConfig>;

  if (!ctx.portalContext.iamEntityConfig) {
    return ctx.entityId;
  }

  if (!iamEntityConfig[entity]) {
    throw new Error(`Unknown entity type: ${entity}.`);
  }

  const contextProperty = iamEntityConfig[entity].contextProperty;
  return ctx[contextProperty];
};

export const getEntityIdFromEntityContext = (
  entity: string,
  ctx: NodeContext,
): string => {
  return ctx.entityContext?.[entity].id;
};
