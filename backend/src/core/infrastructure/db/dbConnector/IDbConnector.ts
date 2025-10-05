export interface IDbConnector {
  isTransactionBegun: boolean;
  queryAsync<TRecord>(sqlStatement: string): Promise<TRecord[]>;
  queryMultipleAsync<TDataSets extends object[][]>(sqlStatements: string[]): Promise<TDataSets>;
  executeAsync(sqlStatement: string): Promise<number>;
  executeMultipleAsync(sqlStatements: string[]): Promise<number>;
  useTrasactionAsync<T>(operation: () => Promise<T>): Promise<T>;
  useTransactionIfNotBegunAsync<T>(operation: () => Promise<T>): Promise<T>;
  commitTransactionAsync(): Promise<void>;
  rollbackTransactionAsync(): Promise<void>;
  disposeAsync(): Promise<void>;
}