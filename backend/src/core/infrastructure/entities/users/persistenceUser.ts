import { User } from "@/core/domain/features/users/entities/user.js";
import { PersistenceRole } from "./persistenceRole.js";

export class PersistenceUser extends User {
  public isNew: boolean = false;
  public isModified: boolean = false;
  public isDeleted: boolean = false;
  public addedRoles: PersistenceRole[] = [];
  public removedRoles: PersistenceRole[] = [];

  public addToRoles(roles: PersistenceRole[]): void {
    super.addToRoles(roles);
    this.addedRoles = roles;
  }

  public removeFromRoles(roles: PersistenceRole[]): void {
    super.removeFromRoles(roles);
    this.removedRoles = roles;
  }

  public changePasswordHash(newPasswordHash: string): void {
    super.changePasswordHash(newPasswordHash);
    this.isModified = true;
  }

  public resetPasswordHash(newPasswordHash: string): void {
    super.resetPasswordHash(newPasswordHash);
    this.isModified = true;
  }

  public markAsDeleted(deletedDateTime: Date): void {
    super.markAsDeleted(deletedDateTime);
    this.isDeleted = true;
  }

  public static newPersistenceUser(
      userName: string,
      passwordHash: string,
      createdDateTime: Date,
      roles: PersistenceRole[]): PersistenceUser {
    const id = crypto.randomUUID();
    const user = new PersistenceUser(id, userName, passwordHash, createdDateTime, null, roles);
    user.isNew = true;

    return user;
  }

  public static rehydrateFromDatabase(
      id: string,
      userName: string,
      passwordHash: string,
      createdDateTime: Date,
      deletedDateTime: Date | null,
      roles: PersistenceRole[]): PersistenceUser {
    return new PersistenceUser(id, userName, passwordHash, createdDateTime, deletedDateTime, roles);
  }
}