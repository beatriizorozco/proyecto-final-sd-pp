export type UserRole = "jinete" | "profesor" | "admin" | "invitado";

export interface CurrentUser {
    id: number | null;
    nombre: string;
    email: string;
    role: UserRole;
}
