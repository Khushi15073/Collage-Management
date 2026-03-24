export interface IPermission {
    name: string;
    description?: string;
}

// for creating permission
export interface CreatePermissionDTO {
    name: string;
    description?: string;
}

// for updating permission
export interface UpdatePermissionDTO {
    name?: string;
    description?: string;
}