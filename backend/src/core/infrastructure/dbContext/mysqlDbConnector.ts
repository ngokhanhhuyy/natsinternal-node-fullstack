import { createPool, type Pool, type PoolConnection, type ResultSetHeader } from "mysql2/promise";
import type { IDbConnector } from "@/core/infrastructure/dbContext/dbConnectorInterface.js";

export class MySqlDbConnector implements IDbConnector {
  private _connection: PoolConnection | null = null;
  private static _pool: Pool;

  public async queryAsync<T>(sql: string, params?: Record<string, any>): Promise<[T]> {
    const connection = await this.getConnectionAsync();
    const [rows] = await connection.execute(sql, params);
    return rows as [T];
  }

  public async executeAsync(sql: string, params?: Record<string, any>): Promise<number> {
    const connection = await this.getConnectionAsync();
    const [result] = await connection.execute(sql, params);
    return (result as ResultSetHeader).affectedRows;
  }

  public async beginTransactionAsync(): Promise<void> {
    const connection = await this.getConnectionAsync();
    await connection.beginTransaction();
  }

  public async commitTransactionAsync(): Promise<void> {
    await this._connection?.commit();
  }

  public async rollbackTransactionAsync(): Promise<void> {
    await this._connection?.rollback();
  }

  public dispose(): void {
    this._connection?.release();
  }

  private async getConnectionAsync(): Promise<PoolConnection> {
    return this._connection ?? await MySqlDbConnector._pool.getConnection();
  }

  static {
    const connectionLimit = parseInt(process.env.DATABASE_CONNECTION_LIMIT as string);
    MySqlDbConnector._pool = createPool({
      uri: process.env.DATABASE_URL as string,
      waitForConnections: true,
      connectionLimit: !isNaN(connectionLimit) ? connectionLimit : undefined
    });
  }
}