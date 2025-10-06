import { User } from "@backend/core/domain/features/users/entities/User.js";
import { PersistenceRole } from "./persistenceRole.js";
import { Role } from "@backend/core/domain/features/users/entities/Role.js";

export class PersistenceUser extends User {
  public addedRoles: PersistenceRole[] = [];
  public removedRoles: PersistenceRole[] = [];
  public readonly rowVersion: number = 0;

  public constructor(
      id: string,
      userName: string,
      passwordHash: string,
      createdDateTime: Date,
      deletedDateTime: Date | null,
      roles: Role[],
      rowVersion: number) {
    super(id, userName, passwordHash, createdDateTime, deletedDateTime, roles);
    this.rowVersion = rowVersion;
  }

  public addToRoles(roles: PersistenceRole[]): void {
    super.addToRoles(roles);
    this.addedRoles = roles;
  }

  public removeFromRoles(roles: PersistenceRole[]): void {
    super.removeFromRoles(roles);
    this.removedRoles = roles;
  }

  public static newPersistenceUser(
      userName: string,
      passwordHash: string,
      createdDateTime: Date,
      roles: PersistenceRole[]): PersistenceUser {
    const id = crypto.randomUUID();
    const user = new PersistenceUser(id, userName, passwordHash, createdDateTime, null, roles, 0);

    return user;
  }

  public static rehydrateFromDatabase(
      id: string,
      userName: string,
      passwordHash: string,
      createdDateTime: Date,
      deletedDateTime: Date | null,
      roles: PersistenceRole[],
      rowVersion: number): PersistenceUser {
    return new PersistenceUser(id, userName, passwordHash, createdDateTime, deletedDateTime, roles, rowVersion);
  }
}