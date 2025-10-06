export type PermissionDbRecord = {
  id: string;
  name: string;
  roleId: string;
}

export interface IPermissionSqlProvider {
  selectPermissionsByUserIds(userIds: string[]): string;
}

export const IPermissionSqlProviderToken: DependencyToken<IPermissionSqlProvider> = Symbol("IPermissionSqlProvider");