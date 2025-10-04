export type PermissionDbRecord = {
  id: string;
  name: string;
  roleId: string;
}

export interface IPermissionSqlProvider {
  getPermissionsUserIdsAsync(userIds: string[]): Promise<PermissionDbRecord[]>;
}