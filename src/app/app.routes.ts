import {Routes} from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing').then(m => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./pages/login').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./pages/signup').then(m => m.SignupComponent) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard').then(m => m.DashboardComponent) },
  { path: 'developer', loadComponent: () => import('./pages/developer').then(m => m.DeveloperComponent) },
  { path: 'developer/project/:id', loadComponent: () => import('./pages/project-details').then(m => m.ProjectDetailsComponent) },
  { path: 'verify/:sessionId', loadComponent: () => import('./pages/verify').then(m => m.VerifyComponent) },
  { path: 'admin/login', loadComponent: () => import('./pages/admin-login').then(m => m.AdminLoginComponent) },
  { path: 'admin/dashboard', loadComponent: () => import('./pages/admin-dashboard').then(m => m.AdminDashboardComponent) },
  { path: 'test-dashboard', loadComponent: () => import('./pages/test-dashboard').then(m => m.TestDashboardComponent) },
  { path: '**', redirectTo: '' }
];
