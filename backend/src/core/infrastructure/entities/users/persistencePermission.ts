import { Permission } from "@backend/core/domain/features/users/entities/permission.js";

export class PersistencePermission extends Permission {
  public static newPersistencePermission(name: string, roleId: string): PersistencePermission {
    return new PersistencePermission(crypto.randomUUID(), name, roleId);
  }

  public static rehydrateFromDatabase(id: string, name: string, roleId: string): PersistencePermission {
    return new PersistencePermission(id, name, roleId);
  }
}