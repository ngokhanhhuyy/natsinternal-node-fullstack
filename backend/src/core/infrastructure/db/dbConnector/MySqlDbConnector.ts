import { createPool, type Pool, type PoolConnection, type ResultSetHeader } from "mysql2/promise";
import type { IDbConnector } from "@backend/core/infrastructure/db/dbConnector/IDbConnector.js";

export class MySqlDbConnector implements IDbConnector {
  private _connection: PoolConnection | null = null;
  private static _pool: Pool;
  public isTransactionBegun: boolean = false;

  public format(sql: string, params: any[]): string {
    return MySqlDbConnector._pool.format(sql, params);
  }

  public async queryAsync<T>(sql: string, params?: Record<string, any>): Promise<T[]> {
    const connection = await this.getConnectionAsync();
    const [rows] = await connection.execute(sql, params);
    return rows as [T];
  }

  public async queryMultipleAsync<TDataSets extends object[][]>(sqlStatements: string[]): Promise<TDataSets> {
    if (!sqlStatements.length) {
      throw new Error("[sqlStatements] cannot be an empty array.");
    }

    const connection = await this.getConnectionAsync();
    const statements = sqlStatements
      .map(statement => {
        const trimmedStatement = statement.trim();
        return trimmedStatement.endsWith(";") ? trimmedStatement : trimmedStatement + ";"
      }).join(" ");
    const [rows] = await connection.query(statements);
    return rows as TDataSets;
  }

  public async executeAsync(sql: string, params?: Record<string, any>): Promise<number> {
    const connection = await this.getConnectionAsync();
    const [result] = await connection.execute(sql, params);
    return (result as ResultSetHeader).affectedRows;
  }

  public async executeMultipleAsync(sqlStatements: string[]): Promise<number> {
    if (!sqlStatements.length) {
      throw new Error("[sqlStatements] cannot be an empty array.");
    }

    const connection = await this.getConnectionAsync();
    const statements = sqlStatements
      .map(statement => {
        const trimmedStatement = statement.trim();
        return trimmedStatement.endsWith(";") ? trimmedStatement : trimmedStatement + ";"
      }).join(" ");
    const [results] = await connection.query(statements);
    return (results as ResultSetHeader[]).reduce((sum, result) => sum + result.affectedRows, 0);
  }

  public async useTransactionAsync<T>(operation: () => Promise<T>): Promise<T> {
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
    const connection = await this.getConnectionAsync();
    await connection.beginTransaction();
    this.isTransactionBegun = true;
  }

  public async commitTransactionAsync(): Promise<void> {
    const connection = await this.getConnectionAsync();
    await connection.commit();
    this.isTransactionBegun = false;
  }

  public async rollbackTransactionAsync(): Promise<void> {
    const connection = await this.getConnectionAsync();
    await connection.rollback();
    this.isTransactionBegun = false;
  }

  public async disposeAsync(): Promise<void> {
    await this.rollbackTransactionAsync();
    this.isTransactionBegun = false;
    this._connection?.release();
  }

  private async getConnectionAsync(): Promise<PoolConnection> {
    if (!this._connection) {
      this._connection = await MySqlDbConnector._pool.getConnection();
    }

    return this._connection;
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