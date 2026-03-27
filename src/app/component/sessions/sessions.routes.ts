import { Routes } from '@angular/router';

export const sessions: Routes = [
  {
    path: '',
    children: [
     
     {
        path: 'login',
        loadComponent: () => import('./login/login').then(m => m.LoginComponent),
        data: {
          title: 'login',
          breadcrumb: 'Default',
        },
      },
     
    ],
  },
];
