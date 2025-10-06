import { AbstractEntity } from "@backend/core/domain/seedworks/entities/abstract-entity.js";
import { Role } from "./Role.js";
import { DomainError } from "@backend/core/domain/errors/domainError.js";

export class User extends AbstractEntity {
  private _id: string;
  private _userName: string;
  private _passwordHash: string;
  private _createdDateTime: Date;
  private _deletedDateTime: Date | null = null;
  private _roles: Role[];

  protected constructor(
      id: string,
      userName: string,
      passwordHash: string,
      createdDateTime: Date,
      deletedDateTime: Date | null,
      roles: Role[]) {
    super();
    this._id = id;
    this._userName = userName;
    this._passwordHash = passwordHash;
    this._createdDateTime = createdDateTime;
    this._deletedDateTime = deletedDateTime;
    this._roles = roles;
  }

  public get id(): string { return this._id; }
  public get userName(): string { return this._userName; }
  public get passwordHash(): string { return this._passwordHash; }
  public get createdDateTime(): Date { return this._createdDateTime; }
  public get deletedDateTime(): Date | null { return this._deletedDateTime; }
  public get roles(): readonly Role[] { return this._roles; }
  public get powerLevel(): number { return this._roles.length ? Math.max(...this._roles.map(r => r.powerLevel)) : 0; }

  public hasPermission(permissionName: string): boolean {
    for (const role of this._roles) {
      for (const permission of role.permissions) {
        if (permission.name == permissionName) {
          return true;
        }
      }
    }

    return false;
  }

  public addToRoles(roles: Role[]): void {
    const existingRoleNames = this._roles.map(r => r.name);
    for (const role of roles) {
      for (const roleName of existingRoleNames) {
        if (role.name == roleName) {
          throw new DomainError(`User with id ${role.id} is already in role ${role.name}.`);
        }

        this._roles.push(role);
      }
    }
  }

  public removeFromRoles(roles: Role[]): void {
    const existingRoleNames = this._roles.map(r => r.name);
    for (const role of roles) {
      if (!existingRoleNames.includes(role.name)) {
        throw new DomainError(`$User with id ${this._id} is not in role ${role.name}.`);
      }

      this._roles = this._roles.filter(r => r.name === role.name);
    }
  }

  public changePasswordHash(newPasswordHash: string): void {
    this._passwordHash = newPasswordHash;
  }

  public resetPasswordHash(newPasswordHash: string): void {
    this._passwordHash = newPasswordHash;
  }

  public markAsDeleted(deletedDateTime: Date): void {
    this._deletedDateTime = deletedDateTime;
  }
}