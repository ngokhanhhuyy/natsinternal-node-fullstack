import { PersistenceError } from "@backend/core/application/unitOfWork/persistenceError.js";
import type { AbstractEntity } from "@backend/core/domain/seedworks/entities/abstract-entity.js";
import type { IDbConnector } from "@backend/core/infrastructure/db/dbConnector/IDbConnector.js";
import type {
  IDbContext,
  IDbContextTransaction,
  PersistenceEntity } from "@backend/core/infrastructure/db/dbContext/IDbContext.js";
import { PersistenceUser } from "@backend/core/infrastructure/entities/users/persistenceUser.js";

type EntityConstructor<T extends AbstractEntity = AbstractEntity> = abstract new(...args: any[]) => AbstractEntity;

export class MySqlManualDbContext implements IDbContext {
  private _dbConnector: IDbConnector;
  private _addedEntitiesMap = new Map<EntityConstructor, PersistenceEntity>();
  private _updatedEntities: PersistenceEntity[] = [];
  private _transaction: IDbContextTransaction | null = null;

  public constructor(dbConnector: IDbConnector) {
    this._dbConnector = dbConnector;
  }

  public add(entity: PersistenceEntity): void {
    if (entity)
  }

  public update(entity: PersistenceEntity): void {
    this._updatedEntities.push(entity);
  }

  public async beginTransactionAsync(): Promise<IDbContextTransaction> {
    await this._dbConnector.beginTransactionAsync();
    this._transaction = {
      commitAsync: async () => { await this._dbConnector.commitTransactionAsync() },
      rollbackAsync: async () => { await this._dbConnector.rollbackTransactionAsync() }
    };

    return this._transaction;
  }

  public async saveChangesAsync(): Promise<number> {
    let affectedRows = 0;
    let shouldCommitTransaction = false;
    if (!this._transaction) {
      this._transaction = await this.beginTransactionAsync();
      shouldCommitTransaction = true;
    }

    try {
      for (const entity of this._addedEntitiesMap) {
        if (entity instanceof PersistenceUser) {
          affectedRows += await this.createUserAsync(entity);
        }
      }

      if (shouldCommitTransaction) {
        await this._transaction.commitAsync();
        this._transaction = null;
      }

      return affectedRows;
    } catch (error) {
      this._transaction?.rollbackAsync();
      throw error;
    }
  }

  private pushEntityToMap(entity: AbstractEntity, map: Map<EntityConstructor, PersistenceEntity[]>): void {
    const keyAndEntityTypePairs = {
      "user": PersistenceUser
    };

    if (entity instanceof PersistenceUser) {
      const entities = map.get(PersistenceUser) ?? [];
    }
  }

  private async createUserAsync(user: PersistenceUser): Promise<number> {
    let affectedRows = await this._dbConnector.executeAsync(`
      INSERT INTO \`Users\` (\`Id\`, \`UserName\`, \`PasswordHash\`)
      VALUES (?, ?, ?);
    `, [user.id, user.userName, user.passwordHash]);

    affectedRows += await this._dbConnector.executeAsync(`
      INSERT INTO \`UserRoles\` (\`UserId\`, \`RoleId\`)
      VALUES (?, ?);
    `, [user.roles.map(role => [user.id, role.id])]);

    return affectedRows;
  }

  private async updateUserAsync(user: PersistenceUser): Promise<number> {
    let affectedRows = await this._dbConnector.executeAsync(`
      UPDATE \`Users\`
      SET \`UserName\` = ?, \`PasswordHash\` = ?
      WHERE \`Id\` = ? AND \`RowVersion\` = ?;
    `, [user.userName, user.passwordHash]);

    if (affectedRows == 0) {
      throw PersistenceError.forConcurrencyConflict();
    }

    affectedRows += await this._dbConnector.executeAsync(`
      INSERT IGNORE INTO \`UserRoles\` (\`UserId\`, \`RoleId\`)
      VALUES ${user.roles.map(_ => "(?, ?)").join(", ")};
    `, [...user.roles.map(role => [role.id, role.id])]);

    affectedRows += await this._dbConnector.executeAsync(`
      DELETE FROM \`UserRoles\`
      WHERE \`UserId\` = ?
      AND \`RoleId\` NOT IN (${user.roles.map(role => role.id)})
      AND \`RoleId\` IN (SELECT \`RoleId\` FROM \`UserRoles\` WHERE \`UserId\` = ?);
    `, [user.id, ...user.roles.map(role => role.id), user.id]);

    return affectedRows;
  }
}