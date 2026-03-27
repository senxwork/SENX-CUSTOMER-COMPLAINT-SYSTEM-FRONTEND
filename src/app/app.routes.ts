import { Routes } from "@angular/router";

import { dashData } from "./shared/routes/routes";
import { AuthGaurd } from "./shared/services/auth.gaurd";

export const routes: Routes = [
  {
    path: "sessions/login",
    loadComponent: () => import("./component/sessions/login/login").then((m) => m.LoginComponent),
  },
  {
    path: "sessions/register",
    loadComponent: () => import("./component/sessions/register/register").then((m) => m.RegisterComponent),
  },
  {
    path: "sessions/error",
    loadComponent: () => import("./component/sessions/error/error").then((m) => m.ErrorComponent),
  },
  {
    path: "sessions/forgot-password",
    loadComponent: () => import("./component/sessions/forgot-password/forgot-password").then((m) => m.ForgotPasswordComponent),
  },
  {
    path: "sessions/reset-password",
    loadComponent: () => import("./component/sessions/reset-password/reset-password").then((m) => m.ResetPasswordComponent),
  },
  {
    path: "public/ticket/:token",
    loadComponent: () => import("./component/public/public-ticket-page/public-ticket-page").then((m) => m.PublicTicketPageComponent),
  },

  {
    path: "",
    redirectTo: "/pages/complaint/list",
    pathMatch: "full",
  },

  {
    path: "",
    canActivate: [AuthGaurd],
    loadComponent: () => import("./shared/component/layout/content/content").then((m) => m.Content),
    children: dashData,
  },

  {
    path: "**",
    redirectTo: "sessions/error"
  }
];
