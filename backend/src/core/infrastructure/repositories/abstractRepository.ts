import { AbstractEntity } from "@backend/core/domain/seedworks/entities/abstract-entity.js";

export class AbstractRepository {
  protected static ensureDomainEntityIsPersistenceEntity<TDomain extends AbstractEntity, TPersistence extends TDomain>(
      entity: AbstractEntity,
      persistenceEntityConstructor: new(...args: any[]) => TPersistence): TPersistence {
    if (entity !instanceof persistenceEntityConstructor) {
      throw new Error(`[${entity.constructor.name}] is not a valid ${persistenceEntityConstructor.name}.`);
    }

    return entity as TPersistence;
  }
}