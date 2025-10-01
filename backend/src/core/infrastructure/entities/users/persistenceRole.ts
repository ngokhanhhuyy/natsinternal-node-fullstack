import { Role } from "@/core/domain/features/users/entities/role.js";
import { PersistencePermission } from "./persistencePermission.js";

export class PersistenceRole extends Role {
  public static newPersistenceRole(
      name: string,
      displayName: string,
      powerLevel: number,
      permissions: PersistencePermission[]) {
    return new PersistenceRole(crypto.randomUUID(), name, displayName, powerLevel, permissions);
  }

  public static rehydrateFromDatabase(
      id: string,
      name: string,
      displayName: string,
      powerLevel: number,
      permissions: PersistencePermission[]) {
    return new PersistenceRole(id, name, displayName, powerLevel, permissions);
  }
}