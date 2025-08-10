import type {Roles} from "../const/roles.ts";

export interface IToken {
    token: string;
    role?: Roles;
}