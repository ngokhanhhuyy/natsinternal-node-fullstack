import { AbstractEntity } from "@backend/core/domain/seedworks/entities/abstract-entity.js";

export class Permission extends AbstractEntity {
  public readonly id: string;
  public readonly name: string;
  public readonly roleId: string;

  protected constructor(id: string, name: string, roleId: string) {
    super();

    this.id = id;
    this.name = name;
    this.roleId = roleId;
  }

  public static newPermission(name: string, roleId: string): Permission {
    return new Permission(crypto.randomUUID(), name, roleId);
  }

  public static rehydrate(id: string, name: string, roleId: string): Permission {
    return new Permission(id, name, roleId);
  }
}