import { Routes } from '@angular/router';

export const dashData: Routes = [
  {
    path: '',
    redirectTo: 'dashboard-maintenance',
    pathMatch: 'full'
  },
  {
    path: 'pages',
    data: {
      title: 'งานที่ได้รับมอบหมาย',
      breadcrumb: 'งานที่ได้รับมอบหมาย',
    },
    loadChildren: () => import('../../../app/component/pages/pages.routes').then(r => r.pages),
  },
 

];
