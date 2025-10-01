export interface IDbConnector {
  queryAsync<T>(sql: string, params?: Record<string, any>): Promise<[T]>;
  executeAsync(sql: string, params?: Record<string, any>): Promise<number>;
  beginTransactionAsync(): Promise<void>;
  commitTransactionAsync(): Promise<void>;
  rollbackTransactionAsync(): Promise<void>;
  dispose(): void;
}