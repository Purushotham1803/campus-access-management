import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  {
    path: 'student',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard, roleGuard(['STUDENT','FACULTY'])],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/student/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent) },
      { path: 'requests', loadComponent: () => import('./pages/student/my-requests/my-requests.component').then(m => m.MyRequestsComponent) },
      { path: 'new-request', loadComponent: () => import('./pages/student/new-request/new-request.component').then(m => m.NewRequestComponent) },
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'requests', loadComponent: () => import('./pages/admin/admin-requests/admin-requests.component').then(m => m.AdminRequestsComponent) },
      { path: 'users', loadComponent: () => import('./pages/admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent) },
      { path: 'register-user', loadComponent: () => import('./pages/admin/admin-register-user/admin-register-user.component').then(m => m.AdminRegisterUserComponent) },
      { path: 'audit-logs', loadComponent: () => import('./pages/admin/admin-audit-logs/admin-audit-logs.component').then(m => m.AdminAuditLogsComponent) },
    ]
  },
  {
    path: 'security',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard, roleGuard(['SECURITY'])],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/security/security-dashboard/security-dashboard.component').then(m => m.SecurityDashboardComponent) },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
