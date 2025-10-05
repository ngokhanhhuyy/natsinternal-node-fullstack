export type PermissionDbRecord = {
  id: string;
  name: string;
  roleId: string;
}

export interface IPermissionSqlProvider {
  selectPermissionsByUserIds(userIds: string[]): string;
}