export interface IDbConnector {
  isTransactionBegun: boolean;
  queryAsync<TRecord>(sql: string, params?: any[]): Promise<TRecord[]>;
  queryMultipleAsync<TDataSets extends object[][]>(args: { sql: string; params?: any[] }[]): Promise<TDataSets>;
  executeAsync(sql: string, params?: any[]): Promise<number>;
  executeMultipleAsync(args: { sql: string, params?: any[] }[]): Promise<number>;
  useTrasactionAsync<T>(operation: () => Promise<T>): Promise<T>;
  useTransactionIfNotBegunAsync<T>(operation: () => Promise<T>): Promise<T>;
  commitTransactionAsync(): Promise<void>;
  rollbackTransactionAsync(): Promise<void>;
  disposeAsync(): Promise<void>;
}