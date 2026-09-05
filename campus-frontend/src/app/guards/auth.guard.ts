import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const token = localStorage.getItem('token');
  if (token) return true;
  inject(Router).navigate(['/login']);
  return false;
};

export const roleGuard = (roles: string[]): CanActivateFn => () => {
  const role = localStorage.getItem('role');
  if (role && roles.includes(role)) return true;
  inject(Router).navigate(['/login']);
  return false;
};
