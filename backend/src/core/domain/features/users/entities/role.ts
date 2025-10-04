import { AbstractEntity } from "@backend/core/domain/seedworks/entities/abstract-entity.js";
import { Permission } from "./permission.js";

export class Role extends AbstractEntity {
  public readonly id: string;
  public readonly name: string;
  public readonly displayName: string;
  public readonly powerLevel: number;
  public readonly permissions: Permission[] = [];

  protected constructor(
      id: string,
      name: string,
      displayName: string,
      powerLevel: number,
      permissions: Permission[]) {
    super();

    this.id = id;
    this.name = name;
    this.displayName = displayName;
    this.powerLevel = powerLevel;
    this.permissions = permissions;
  }
}