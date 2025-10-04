import type { PersistenceUser } from "@backend/core/infrastructure/entities/users/persistenceUser.js";
import type { PersistenceRole } from "@backend/core/infrastructure/entities/users/persistenceRole.js";
import type { PersistencePermission } from "@backend/core/infrastructure/entities/users/persistencePermission.js";

export type PersistenceEntity =
  | PersistenceUser
  | PersistenceRole
  | PersistencePermission;

export interface IDbContext {
  add(entity: PersistenceEntity): void;
  update(entity: PersistenceEntity): void;
  remove(entity: PersistenceEntity): void;
  saveChangesAsync(): Promise<number>;
  beginTransactionAsync(): Promise<IDbContextTransaction>;
}

export interface IDbContextTransaction {
  commitAsync(): Promise<void>;
  rollbackAsync(): Promise<void>;
}