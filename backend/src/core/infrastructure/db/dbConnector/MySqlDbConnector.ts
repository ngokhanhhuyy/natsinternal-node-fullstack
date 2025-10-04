import { createPool, type Pool, type PoolConnection, type ResultSetHeader } from "mysql2/promise";
import type { IDbConnector } from "@backend/core/infrastructure/db/dbConnector/IDbConnector.js";

export class MySqlDbConnector implements IDbConnector {
  private _connection: PoolConnection;
  private static _pool: Pool;
  public isTransactionBegun: boolean = false;

  public constructor(connection: PoolConnection) {
    this._connection = connection;
  }

  public format(sql: string, params: any[]): string {
    return this._connection.format(sql, params);
  }

  public async queryAsync<T>(
      sql: string,
      params?: Record<string, any>): Promise<T[]> {
    const [rows] = await this._connection.execute(sql, params);
    return rows as [T];
  }

  public async queryMultipleAsync<TDataSets extends object[][]>(
      args: { sql: string; params?: any[] }[]): Promise<TDataSets> {
    if (!args.length) {
      throw new Error("[args] cannot be an empty array.");
    }

    const statements = args.map(arg => this._connection.format(arg.sql, arg.params)).join("");
    const [rows] = await this._connection.query(statements);
    return rows as TDataSets;
  }

  public async executeAsync(sql: string, params?: Record<string, any>): Promise<number> {
    const [result] = await this._connection.execute(sql, params);
    return (result as ResultSetHeader).affectedRows;
  }

  public async executeMultipleAsync(args: { sql: string; params?: any[] }[]): Promise<number> {
    if (!args.length) {
      throw new Error("[args] cannot be an empty array.");
    }

    const statements = args.map(arg => this._connection.format(arg.sql, arg.params)).join("");
    const [results] = await this._connection.query(statements);
    return (results as ResultSetHeader[]).reduce((sum, result) => sum + result.affectedRows, 0);
  }

  public async useTrasactionAsync<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isTransactionBegun) {
      throw new Error("A transaction has already begun. Consider to commit or rollback first.");
    }

    await this.beginTransactionAsync();
    try {
      const result = await operation();
      await this.commitTransactionAsync();
      return result;
    } catch (error) {
      await this.rollbackTransactionAsync();
      throw error;
    }
  }

  public async useTransactionIfNotBegunAsync<T>(operation: () => Promise<T>): Promise<T> {
    let shouldCommitOrRollback = false;
    if (!this.isTransactionBegun) {
      await this.beginTransactionAsync();
      shouldCommitOrRollback = true;
    }

    try {
      const result = await operation();

      if (shouldCommitOrRollback) {
        await this.commitTransactionAsync();
      }

      return result;
    } catch (error) {
      if (shouldCommitOrRollback) {
        await this.rollbackTransactionAsync();
      }

      throw error;
    }
  }

  public async beginTransactionAsync(): Promise<void> {
    await this._connection.beginTransaction();
    this.isTransactionBegun = true;
  }

  public async commitTransactionAsync(): Promise<void> {
    await this._connection.commit();
    this.isTransactionBegun = false;
  }

  public async rollbackTransactionAsync(): Promise<void> {
    await this._connection.rollback();
    this.isTransactionBegun = false;
  }

  public async disposeAsync(): Promise<void> {
    await this.rollbackTransactionAsync();
    this.isTransactionBegun = false;
    this._connection?.release();
  }

  static {
    const connectionLimit = parseInt(process.env.DATABASE_CONNECTION_LIMIT as string);
    MySqlDbConnector._pool = createPool({
      uri: process.env.DATABASE_URL as string,
      waitForConnections: true,
      connectionLimit: !isNaN(connectionLimit) ? connectionLimit : undefined,
      multipleStatements: true
    });
  }
}