import type {Roles} from "../const/roles.ts";

export interface IUserEntity {
    id: number | null;
    username: string;
    email: string;
    role: Roles.DEFAULT | Roles.USER | Roles.ADMIN;
    firstName: string;
    lastName: string;
}

export interface IUser {
    token: string;
    role?: Roles;
    user: IUserEntity
}