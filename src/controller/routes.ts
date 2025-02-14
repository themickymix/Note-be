import noteRoutes from "./note/routes";
import userRoutes from "./user/routes";

export const routes = [userRoutes, noteRoutes] as const;

export type Routes = typeof routes;